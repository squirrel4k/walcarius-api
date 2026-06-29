# Rapport d'audit approfondi — Walcarius WebService

> Date : 2026-03-29
> Stack : NestJS 5 · TypeScript · MySQL (TypeORM) · MongoDB (Mongoose) · Redis · GraphQL (Apollo)
> Périmètre : analyse statique complète de tous les fichiers source, configuration, dépendances et schéma SQL

---

## Sommaire

1. [Architecture & structure](#1-architecture--structure)
2. [Qualité du code](#2-qualité-du-code)
3. [Sécurité — Injections](#3-sécurité--injections-sql)
4. [Sécurité — Secrets exposés](#4-sécurité--secrets-exposés)
5. [Sécurité — Authentification & autorisation](#5-sécurité--authentification--autorisation)
6. [Sécurité — Headers & CORS](#6-sécurité--headers--cors)
7. [Performance](#7-performance)
8. [Accessibilité](#8-accessibilité)
9. [Tests](#9-tests)
10. [Dépendances](#10-dépendances)
11. [Plan d'action](#11-plan-daction)

---

## 1. Architecture & structure

### Vue d'ensemble

```
src/
  app/
    auth/               # JWT, login, reset password
    common/             # Logger Winston, interceptors, JWT wrapper
    elements/           # Catégories, éléments, matières, natures
    files/              # Serveur de fichiers PDF
    mailer/             # Nodemailer + templates EJS
    pdf/                # Génération PDF via Puppeteer
    permission/         # RBAC (rôles/catégories)
    price-requests/     # Demandes de prix
    projects/           # Gestion de projets
    purchase-orders/    # Bons de commande
    purchaseOrderAdmissionLog/
    quotes/             # Devis
    scan-pdf/           # Scan PDF
    smtp-config/        # Config SMTP par utilisateur
    suppliers/          # Fournisseurs
    uniquenumber/       # Générateur de références
    users/              # Utilisateurs
  core/
    dataloader/         # DataLoader (batch GraphQL)
    decorators/         # @Access, @Usr, @UUID
    guards/             # AuthenticationGuard, AccessGuard
    interceptors/       # JwtInterceptor, UuidInterceptor
    utils/              # BcryptUtil, JwtUtil, ErrorUtil…
  graphql-typedefs/     # Schémas GraphQL
sql/                    # 29 migrations SQL
assets/                 # i18n, encryption.js
templates/              # Emails et PDF (EJS)
```

| Sévérité | Fichier | Observation | Suggestion |
|----------|---------|-------------|------------|
| `warning` | `ecosystem.config.js` | `NODE_ENV: 'development'` est la valeur par défaut dans `env`, ce qui signifie que `pm2 start` sans option lance l'app en mode dev | Passer `env_production` en premier ou renommer en `env_development` / `env_production` clairement |
| `warning` | `/` | Aucun `Dockerfile` ni `docker-compose.yml` — l'environnement de démarrage (MySQL, MongoDB, Redis) n'est pas reproductible | Ajouter un `docker-compose.dev.yml` avec les trois services |
| `info` | `src/app/app.module.ts` | Coexistence REST + GraphQL sans règle documentée sur le choix de l'un ou l'autre — `FileController` est REST, tout le reste est GraphQL | Documenter la frontière dans un ADR ou le README |
| `info` | `src/main.ts:53-55` | Port calculé dynamiquement en mode cluster PM2 (`WAL_PORT + NODE_APP_INSTANCE`) — correct mais silencieusement ignoré si `WAL_PORT` est absent | Ajouter une vérification explicite des variables d'environnement obligatoires au démarrage |

---

## 2. Qualité du code

### 2.1 Gestion asynchrone défaillante

| Sévérité | Fichier | Lignes | Observation | Suggestion |
|----------|---------|--------|-------------|------------|
| `critical` | `src/app/permission/services/permission.service.ts` | 72-88 | `savePermissionsToLocalStorage()` retourne `void` et utilise `.then()` sans aucun `.catch()`. Si `findAll()` échoue, l'erreur est silencieusement avalée et le fichier de permissions n'est jamais mis à jour | Soit rendre la méthode `async` et `await` l'appel, soit ajouter `.catch(err => this._logger.error(err))` |
| `warning` | `src/app/common/interceptors/rest-logger.interceptor.ts` | 22 | `map(async (result) => {...})` — un opérateur RxJS `map` avec une fonction `async` retourne un `Observable<Promise<T>>` au lieu d'un `Observable<T>`. Les erreurs et les résultats ne sont pas correctement chaînés | Remplacer `map(async …)` par `mergeMap(async …)` ou `switchMap` |
| `warning` | `src/app/common/interceptors/gql-logger.interceptor.ts` | 25 | Même problème `map(async …)` que ci-dessus | Même correction |
| `warning` | `src/app/auth/auth.service.ts` | 104 | `this.authorized(...)` est appelée de manière synchrone pendant le login (ligne 104) mais elle peut déclencher `savePermissionsToLocalStorage()` en interne — aucun `await` possible sur son résultat | Refactorer `authorized()` en méthode `async` utilisant Redis |

### 2.2 Méthode synchrone bloquante dans un serveur async

| Sévérité | Fichier | Lignes | Observation | Suggestion |
|----------|---------|--------|-------------|------------|
| `warning` | `src/app/auth/auth.service.ts` | 122-147 | `authorized()` crée une instance `LocalStorage` (I/O fichier synchrone) à chaque appel. En mode cluster PM2 (4 workers), chaque worker maintient son propre fichier `./scratch/` — les permissions peuvent diverger entre instances | Remplacer par `await redisClient.get('dataPermission')` avec TTL de 10 min |
| `warning` | `src/app/permission/services/permission.service.ts` | 85-86 | `new LocalStorage('./scratch')` puis `setItem` : accès disque bloquant dans une boucle potentiellement fréquente | Même correction Redis |

### 2.3 Type safety insuffisante

| Sévérité | Fichier | Lignes | Observation | Suggestion |
|----------|---------|--------|-------------|------------|
| `warning` | `tsconfig.json` | 5 | `"noImplicitAny": false` — TypeScript accepte silencieusement tous les `any` implicites, ce qui annule une grande partie de la sûreté de typage | Passer à `true` et corriger les erreurs de compilation résultantes progressivement |
| `warning` | `src/core/guards/access.guard.ts` | 23 | `user.grant` comparé par `indexOf` (chaîne brute). Si le JWT contient un grant inconnu, aucun avertissement | Utiliser `Object.values(GRANT_TOKEN).includes(user.grant)` |
| `info` | Plusieurs services | — | Usage répété de `<any>` pour contourner le typage TypeORM (`<any>toSave`, `(<any>currentUpdate)`) | Typer correctement les paramètres `save()` / `update()` |

### 2.4 Cohérence du code

| Sévérité | Fichier | Lignes | Observation | Suggestion |
|----------|---------|--------|-------------|------------|
| `warning` | `src/app/common/interceptors/rest-logger.interceptor.ts` | 42 | `request.user.login` est utilisé à la ligne 42 pour le log, mais l'entité `User` expose `username`, pas `login` → sera toujours `undefined` dans les logs | Remplacer par `request.user.username` (cohérent avec la ligne 35 du même fichier) |
| `info` | `src/app/auth/auth.service.ts` | 26-27, 33 | Imports commentés laissés dans le code (`forwardRef`, `_smtpRepo`) | Supprimer |
| `info` | Plusieurs fichiers | — | Mélange de `!= null`, `!user`, `user && !user.deletedAt` pour les null checks — pas de convention uniforme | Choisir un style (`!= null` ou `=== null`) et l'appliquer uniformément |
| `info` | `src/app/mailer/managers/mailer.manager.ts` | 105 | `console.log(e)` dans le catch — debug laissé en production | Remplacer par `this._logger.error(e)` |
| `info` | `src/app/files/files.controllers.ts` | 19 | `console.log(error)` dans le catch | Même correction |

---

## 3. Sécurité — Injections SQL

### Injection SQL via template littéral TypeORM

TypeORM fournit deux syntaxes pour les `WHERE` avec paramètres :
- **Sécurisée** : `.where("reference LIKE :search", { search })` → paramètre lié par le driver
- **Vulnérable** : `.where(\`reference LIKE "${search}"\`, { search })` → interpolation directe dans la chaîne SQL avant envoi

Les trois occurrences ci-dessous utilisent la forme vulnérable.

---

#### INJ-01 — Price Request Service

| | |
|---|---|
| **Sévérité** | `critical` |
| **Fichier** | `src/app/price-requests/services/price-request.service.ts` |
| **Ligne** | 111 |

**Code vulnérable :**
```typescript
const lastPriceRequest = await this._baseRepo.createQueryBuilder()
    .where(`reference LIKE "${search}"`, { search })   // ← interpolation directe
    .orderBy("reference", "DESC")
    .limit(1)
    .getOne();
```

**Explication :** La variable `search` est interpolée directement dans la chaîne de la clause `WHERE` avant que TypeORM ne construise la requête. Bien que `{ search }` soit passé en second argument (syntaxe correcte des paramètres liés), il est ignoré car aucun placeholder `:search` n'apparaît dans la chaîne. Un attaquant peut injecter via ce paramètre.

**Fix :**
```typescript
.where("reference LIKE :search", { search })
```

---

#### INJ-02 — Purchase Order Service

| | |
|---|---|
| **Sévérité** | `critical` |
| **Fichier** | `src/app/purchase-orders/services/purchase-order.service.ts` |
| **Ligne** | 143 |

**Code vulnérable :**
```typescript
const lastPurchaseOrder = await this._baseRepo.createQueryBuilder()
    .where(`reference LIKE "${search}"`, { search })   // ← même pattern
    .orderBy("reference", "DESC")
    .limit(1)
    .getOne();
```

**Fix :** Identique à INJ-01.

---

#### INJ-03 — DataLoader SupplierOfferElement

| | |
|---|---|
| **Sévérité** | `critical` |
| **Fichier** | `src/app/price-requests/loaders/supplier-offer-element-by-possible-price-request-element.loader.ts` |
| **Lignes** | 38-40 |

**Code vulnérable :**
```typescript
private async findByIds(ids: LoaderKey[]): Promise<SupplierOfferElement[][]> {
    const sqlIds: string[] = ids.map(id => `(${id.id}, ${id.supplierOfferId})`);
    const supplierOfferElements = await this._supplierOfferElementRepo.createQueryBuilder("soe")
        .where(`(soe.priceRequestElementId, soe.supplierOfferId) IN (${sqlIds.join(", ")})`)
        .getMany();
```

**Explication :** `id.id` et `id.supplierOfferId` sont des entiers issus des clés du DataLoader. Si ces valeurs proviennent d'une entrée utilisateur non validée en amont, un attaquant peut injecter dans le `IN (...)`. La syntaxe de tuple `(col1, col2) IN (...)` n'est pas supportée par TypeORM en mode paramétré — la solution correcte est un `OR` multiple avec des paramètres liés ou une sous-requête.

**Fix :**
```typescript
const conditions = ids.map((id, i) =>
    `(soe.priceRequestElementId = :id${i} AND soe.supplierOfferId = :soid${i})`
);
const params = ids.reduce((acc, id, i) => ({
    ...acc, [`id${i}`]: id.id, [`soid${i}`]: id.supplierOfferId
}), {});
const supplierOfferElements = await this._supplierOfferElementRepo
    .createQueryBuilder("soe")
    .where(conditions.join(" OR "), params)
    .getMany();
```

---

## 4. Sécurité — Secrets exposés

### SEC-01 — Clé de chiffrement AES hardcodée

| | |
|---|---|
| **Sévérité** | `critical` |
| **Fichier** | `assets/encryption.js` |
| **Lignes** | 5, 29-31 |

**Code :**
```javascript
const ENCRYPTION_KEY = "02f5c4a9d6c9f460d70367ee0e2b944b"; // Must be 256 bits (32 characters)

function decrypt(text) {
    try {
        // ...AES-256-CBC decryption...
    } catch (err) {
        return text;   // ← retourne le texte EN CLAIR si le déchiffrement échoue
    }
}
```

**Double problème :**
1. La clé AES-256 est codée en dur dans le source — toute personne ayant accès au dépôt peut déchiffrer tous les mots de passe SMTP stockés en base
2. Le fallback `return text` en cas d'erreur de déchiffrement signifie qu'un texte chiffré corrompu sera retourné tel quel au transporteur Nodemailer — fuite silencieuse

**Fix :**
```javascript
const ENCRYPTION_KEY = process.env.WAL_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error("WAL_ENCRYPTION_KEY must be set and be 32 characters");
}
// Dans decrypt() : propager l'erreur plutôt que return text
```

---

### SEC-02 — Credentials en clair dans les fichiers d'environnement

| | |
|---|---|
| **Sévérité** | `critical` |
| **Fichiers** | `.env`, `.env.stagging` |

**Valeurs exposées dans `.env` :**
- `WAL_MYSQL_PASSWORD=cUJ9U^D-XY=ufDxan2Ha` — mot de passe base de données production
- `WAL_MAILER_USER=anne-sophie@walcarius.be` — compte email réel
- `WAL_MAILER_PASSWORD=Waju1977` — mot de passe email en clair
- `WAL_AUTH_SECRET_KEY=gcu3mwcq4yhjaybg99iv_3-qtx24ti1_` — secret JWT

**Actions immédiates requises :**
1. Rotation de TOUS ces credentials
2. Ajouter `.env` et `.env.stagging` au `.gitignore`
3. Purger l'historique git : `git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env .env.stagging' --prune-empty --tag-name-filter cat -- --all` (ou utiliser BFG Repo Cleaner)
4. Créer un `.env.example` avec des valeurs de substitution uniquement

---

## 5. Sécurité — Authentification & autorisation

### AUTH-01 — Authentification opt-in (routes publiques par défaut)

| | |
|---|---|
| **Sévérité** | `critical` |
| **Fichier** | `src/core/guards/auth.guard.ts` |
| **Lignes** | 21-26 |

**Code :**
```typescript
public canActivate(context: ExecutionContext) {
    const validAccesses: string[] = this._reflector.get<string[]>("access", context.getHandler());

    // Si aucun @Access() n'est déclaré → route publique
    return validAccesses && validAccesses.length > 0 ? super.canActivate(context) : true;
}
```

**Problème :** Tout resolver ou controller qui oublie le décorateur `@Access()` est **automatiquement public**. En pratique, si un développeur ajoute un nouveau resolver sans penser à l'annoter, il expose des données sans protection.

**Fix recommandé — inverser le principe :**
```typescript
// Créer un décorateur @Public()
export const Public = () => SetMetadata('isPublic', true);

// Dans le guard
public canActivate(context: ExecutionContext) {
    const isPublic = this._reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) { return true; }
    return super.canActivate(context); // auth obligatoire par défaut
}
```

---

### AUTH-02 — Rafraîchissement JWT sans vérification de signature

| | |
|---|---|
| **Sévérité** | `critical` |
| **Fichier** | `src/core/utils/jwt.util.ts` |
| **Lignes** | 13-19 |

**Code :**
```typescript
public async refreshToken(token: string, secret: string, expire?: number | string): Promise<string> {
    const decoded: any = jwt.decode(token);  // ← decode() sans vérification de signature
    delete decoded.iat;
    delete decoded.exp;
    return jwt.sign(decoded, secret, expire ? { expiresIn: expire } : null);
}
```

**Problème :** `jwt.decode()` ne vérifie **pas** la signature. Un token falsifié (mauvaise signature, payload modifié) sera accepté et re-signé avec les nouvelles données. Un attaquant qui dispose d'un token expiré ou altéré peut le faire rafraîchir indéfiniment.

**Fix :**
```typescript
public async refreshToken(token: string, secret: string, expire?: number | string): Promise<string> {
    const decoded: any = jwt.verify(token, secret); // lève une exception si invalide
    delete decoded.iat;
    delete decoded.exp;
    return jwt.sign(decoded, secret, expire ? { expiresIn: expire } : null);
}
```

---

### AUTH-03 — Traversée de chemin sur l'endpoint de fichiers

| | |
|---|---|
| **Sévérité** | `critical` |
| **Fichier** | `src/app/files/files.controllers.ts` |
| **Lignes** | 10-23 |

**Code :**
```typescript
@Controller('filesPdf')
export class FileController {
    @Get(':name')
    getFile(@Res() res: Response, @Param("name") name: string) {
        try {
            if (existsSync(`filesPdf/${name}`)) {
                const file = createReadStream(join(process.cwd(), `filesPdf/${name}`));
                file.pipe(res);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
```

**Deux problèmes :**
1. **Aucune authentification** : le contrôleur ne porte aucun guard — tout utilisateur anonyme peut accéder aux fichiers PDF
2. **Path traversal** : `name = "../../.env"` → le `join()` résout en `<cwd>/.env` qui sera streamé tel quel. `existsSync()` passera si le fichier existe

**Fix :**
```typescript
@Controller('filesPdf')
@UseGuards(AuthenticationGuard, AccessGuard)
export class FileController {
    @Get(':name')
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    getFile(@Res() res: Response, @Param("name") name: string) {
        // Valider le nom : seulement lettres, chiffres, tirets, extension .pdf
        if (!/^[\w\-]+\.pdf$/.test(name)) {
            throw new BadRequestException();
        }
        const safePath = join(process.cwd(), 'filesPdf', name);
        // S'assurer que le chemin résolu reste dans le dossier autorisé
        if (!safePath.startsWith(join(process.cwd(), 'filesPdf'))) {
            throw new ForbiddenException();
        }
        if (existsSync(safePath)) {
            createReadStream(safePath).pipe(res);
        }
    }
}
```

---

### AUTH-04 — Token de reset stocké en clair

| | |
|---|---|
| **Sévérité** | `warning` |
| **Fichier** | `src/app/auth/auth.service.ts` |
| **Lignes** | 174-176 |

**Code :**
```typescript
const resetToken = v4();
const token = await this._jwtSrv.genPasswordToken({ login: user.username, uuid: resetToken }, true);
await this._userSrv.update(user.id, { resetToken }, uuid);
// → resetToken (UUID v4 en clair) est stocké tel quel en base dans la colonne VARCHAR(50)
```

**Problème :** Si la base de données est compromise, tous les tokens de reset actifs sont directement exploitables.

**Fix :** Stocker `crypto.createHash('sha256').update(resetToken).digest('hex')` en base. À la vérification, comparer les hashes.

---

### AUTH-05 — Absence de protection brute-force

| | |
|---|---|
| **Sévérité** | `warning` |
| **Fichier** | `src/app/auth/auth.controller.ts` (et resolver GraphQL) |

Aucune limite de tentatives sur l'endpoint `/login` ni sur le resolver `authenticate`. Un attaquant peut tenter des millions de mots de passe sans être bloqué.

**Fix :** Installer `@nestjs/throttler` et configurer :
```typescript
ThrottlerModule.forRoot({ ttl: 900, limit: 5 }) // 5 tentatives / 15 min
```

---

### AUTH-06 — Validation insuffisante du DTO de login

| | |
|---|---|
| **Sévérité** | `warning` |
| **Fichier** | `src/app/auth/dto/auth.dto.ts` |

**Code :**
```typescript
export class RequireTokenDto {
    @IsNotEmpty()
    @IsString()
    readonly email: string;    // ← pas @IsEmail()

    @IsNotEmpty()
    @IsString()
    readonly password: string; // ← aucune contrainte de longueur
}
```

**Fix :**
```typescript
@IsEmail()
readonly email: string;

@MinLength(8)
@MaxLength(128)
readonly password: string;
```

---

### AUTH-07 — Permissions pouvant diverger en mode cluster

| | |
|---|---|
| **Sévérité** | `warning` |
| **Fichier** | `src/app/auth/auth.service.ts` |
| **Lignes** | 122-147 |

Chaque worker PM2 maintient son propre fichier `./scratch/dataPermission`. Une modification des permissions en base met jusqu'à 10 minutes à se propager, et seulement sur le worker qui reçoit la prochaine requête.

**Fix :** Remplacer `LocalStorage` par Redis avec `SET dataPermission <json> EX 600`.

---

### AUTH-08 — CSRF généré mais jamais validé

| | |
|---|---|
| **Sévérité** | `warning` |
| **Fichier** | `src/app/auth/auth.service.ts:108`, `src/main.ts:18-19` |

Un token CSRF est généré au login (`const csrf = v4()`) et exposé dans les headers CORS (`CSRF_HEADER_NAME`), mais aucun guard ou middleware ne valide ce token sur les requêtes mutantes.

---

## 6. Sécurité — Headers & CORS

| Sévérité | Fichier | Lignes | Observation | Suggestion |
|----------|---------|--------|-------------|------------|
| `warning` | `src/main.ts` | 18 | Headers CORS autorisés : `"lazyinit"`, `"lazyupdate"`, `"normalizednames"` — ces noms correspondent à des artefacts internes d'Angular HttpClient qui ne devraient jamais atteindre le serveur | Supprimer ces trois entrées de `allowedHeaders` |
| `warning` | `src/main.ts` | — | Aucun header de sécurité HTTP configuré : pas de `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy` | Ajouter `helmet` : `app.use(require('helmet')())` |
| `warning` | `src/app/pdf/managers/pdf.manager.ts` | 30 | Puppeteer lancé avec `--no-sandbox --disable-setuid-sandbox` — justifié si les templates sont statiques, mais risqué si des données utilisateur sont injectées dans les templates EJS | S'assurer que toutes les variables EJS sont échappées (EJS le fait par défaut avec `<%= %>`, mais `<%- %>` ne l'est pas) |
| `info` | `.env.stagging` | — | `WAL_GRAPHQL_PLAYGROUND=true` et `WAL_GRAPHQL_INTROSPECTION=true` sur l'environnement de staging — expose la totalité du schéma GraphQL | Désactiver en staging ; ne jamais activer en production |
| `info` | `src/main.ts` | 50 | `secureConnection: false` dans la config Nodemailer — STARTTLS sera utilisé sur le port 587, mais sans vérification du certificat explicite | Ajouter `tls: { rejectUnauthorized: true }` à la config transport |

---

## 7. Performance

| Sévérité | Fichier | Lignes | Observation | Suggestion |
|----------|---------|--------|-------------|------------|
| `warning` | `src/app/app.module.ts` | GraphQLModule | Aucune limite de profondeur ni de complexité des requêtes GraphQL — une requête imbriquée peut déclencher des dizaines de jointures | Ajouter `validationRules` avec `graphql-depth-limit` (max 7) et `graphql-validation-complexity` |
| `warning` | `src/app/auth/auth.service.ts` | 122-147 | `new LocalStorage('./scratch')` crée un objet à chaque appel de `authorized()` — I/O fichier synchrone bloquant pour chaque requête authentifiée | Migrer vers Redis (déjà disponible dans le projet) |
| `warning` | `src/app/mailer/managers/mailer.manager.ts` | 88-100 | `_initEmail(smtpConfig)` recrée l'instance entière du transporteur Nodemailer à chaque envoi si un `smtpConfig` personnalisé est passé, puis la réinitialise. La création de transporteur est coûteuse | Utiliser un cache de transporteurs indexés par `smtpConfig.id` |
| `info` | `src/core/dataloader/` | — | Les DataLoaders sont instanciés par `uuid` de requête (bonne pratique), mais tous les resolvers n'en tirent pas parti — des requêtes sans DataLoader génèrent des N+1 | Auditer chaque resolver de relation pour s'assurer de l'usage des loaders |
| `info` | `src/main.ts` | 38-39 | `body-parser` limité à 10 MB sur toutes les routes REST, mais aucune limite définie sur le transport GraphQL | Configurer `bodyParserConfig: { limit: '1mb' }` dans `GraphQLModule.forRoot()` |
| `info` | `src/app/pdf/managers/pdf.manager.ts` | 56 | Le PDF est généré dans `WAL_TMP_FILE_DEST` avec un UUID comme nom, mais aucune routine de nettoyage des fichiers temporaires n'est visible | Ajouter un cron ou supprimer le fichier après envoi |

---

## 8. Accessibilité

Ce projet est une API backend pure — il n'y a pas de rendu HTML direct. Les points ci-dessous concernent les artefacts générés.

| Sévérité | Fichier | Observation | Suggestion |
|----------|---------|-------------|------------|
| `info` | `templates/mails/` | Les templates email sont en EJS mais non testés sur les clients mail majeurs (Outlook, Apple Mail, Gmail) | Tester via un service comme Litmus ou Mail Tester |
| `info` | `src/app/pdf/managers/pdf.manager.ts` | Les PDFs générés par Puppeteer ne sont pas balisés PDF/UA (accessibilité pour lecteurs d'écran) | Si accessibilité requise : post-traiter avec une librairie PDF ou utiliser des balises CSS `@page` adaptées |
| `info` | `assets/i18n/` | Trois langues supportées (EN, FR, NL) mais le fallback est le français si la clé n'existe pas — comportement potentiellement incohérent pour des utilisateurs néerlandophones | Documenter ce comportement et compléter les traductions manquantes |

---

## 9. Tests

| Sévérité | Observation | Fichier | Suggestion |
|----------|-------------|---------|------------|
| `critical` | **Zéro fichier de test** dans tout le projet malgré une configuration Jest complète dans `package.json` | `src/**/*.spec.ts` (inexistant) | Commencer par les chemins critiques : `auth.service`, `encryption.js`, `auth.guard`, `access.guard`, les trois injections SQL |
| `warning` | Aucun test de migration SQL — les 29 fichiers `sql/` ne sont jamais validés automatiquement | `sql/*.sql` | Ajouter un test d'intégration qui joue les migrations sur une base de test MySQL |
| `warning` | Aucun test end-to-end des resolvers GraphQL | — | Utiliser `@nestjs/testing` + `supertest` pour les scénarios `login → query → mutation` |
| `warning` | `ts-jest 23.1.3` (2018) est incompatible avec TypeScript 4.x sans patch manuel | `package.json` | Mettre à jour vers `ts-jest ^29` avant d'écrire les tests |
| `info` | Aucune configuration de couverture de code minimale | `package.json` | Ajouter `"coverageThreshold": { "global": { "lines": 60 } }` comme premier objectif |

---

## 10. Dépendances

Le projet utilise des versions figées à 2018-2019. NestJS 5 est en fin de vie depuis début 2020. Plusieurs packages ont des CVE critiques connues.

### Dépendances critiques (EOL ou CVE)

| Sévérité | Package | Version actuelle | Version actuelle stable | Risque principal |
|----------|---------|-----------------|------------------------|-----------------|
| `critical` | `@nestjs/common` | 5.4.0 | 10.x | EOL — pas de correctifs de sécurité depuis 2020 |
| `critical` | `@nestjs/core` | 5.4.0 | 10.x | Idem |
| `critical` | `@nestjs/graphql` | 5.5.7 | 12.x | Idem |
| `critical` | `@nestjs/jwt` | 0.3.0 | 10.x | API incompatible, pas de rotation de clés |
| `critical` | `typeorm` | 0.2.19 | 0.3.x | CVE d'injection SQL dans certaines versions 0.2.x |
| `critical` | `mongoose` | 5.4.17 | 8.x | CVE sur requêtes malformées (prototype pollution) |
| `critical` | `puppeteer` | 2.0.0 | 22.x | Chromium bundlé avec de nombreuses CVE critiques non patchées |
| `critical` | `graphql` | 14.1.1 | 16.x | Vulnérabilités de déni de service sur certaines requêtes |
| `warning` | `bcrypt` | 3.0.4 | 5.x | Mises à jour de sécurité disponibles |
| `warning` | `express` | 4.16.4 | 4.21.x | Patches de sécurité disponibles |
| `warning` | `nodemailer` | 5.1.1 | 6.x | Corrections de sécurité |
| `warning` | `passport-jwt` | 4.0.0 | 4.0.1 | Patch disponible |
| `warning` | `dotenv` | 6.2.0 | 16.x | — |
| `warning` | `class-validator` | 0.9.1 | 0.14.x | Corrections de bypass de validation |

### Dépendances dépréciées

| Sévérité | Package | Observation | Suggestion |
|----------|---------|-------------|------------|
| `warning` | `tslint` | Officiellement déprécié — plus maintenu | Migrer vers `eslint` + `@typescript-eslint` |
| `warning` | `ts-jest` | 23.1.3 (2018) | Mettre à jour vers `^29` |
| `info` | `node-localstorage` | Conçu pour simuler `localStorage` en Node — usage détourné comme cache serveur | Supprimer, remplacer par Redis |
| `info` | `ts-localstorage` | Même problème | Supprimer |
| `info` | `uuid/v4` (import de sous-chemin) | `import * as v4 from "uuid/v4"` est déprécié depuis uuid v7 | `import { v4 as uuidv4 } from "uuid"` |

### Commandes d'audit recommandées

```bash
npm audit                    # Liste toutes les CVE connues
npm audit fix                # Applique les fixes non-breaking
npm audit fix --force        # Applique les fixes breaking (tester en dev d'abord)
npx npm-check-updates -u     # Propose les mises à jour disponibles
```

---

## 11. Plan d'action

### P0 — Immédiat (< 48h) — Risque de compromission active

| # | Action | Fichier(s) |
|---|--------|------------|
| 1 | **Rotation** de tous les credentials exposés (MySQL, email, JWT secret) | `.env`, base de données, compte Office 365 |
| 2 | **Supprimer** `.env` et `.env.stagging` du dépôt git + purger l'historique | `.gitignore`, BFG Repo Cleaner |
| 3 | **Corriger** les 3 injections SQL (INJ-01, INJ-02, INJ-03) | `price-request.service.ts:111`, `purchase-order.service.ts:143`, `soe-loader.ts:40` |
| 4 | **Déplacer** la clé AES dans `process.env.WAL_ENCRYPTION_KEY` + supprimer le fallback plaintext | `assets/encryption.js:5,30` |
| 5 | **Ajouter** authentification + validation du nom sur `FileController` | `src/app/files/files.controllers.ts` |

### P1 — Court terme (< 2 semaines)

| # | Action | Fichier(s) |
|---|--------|------------|
| 6 | Inverser le pattern d'auth (opt-out via `@Public()` au lieu d'opt-in via `@Access()`) | `src/core/guards/auth.guard.ts` |
| 7 | Corriger `JwtUtil.refreshToken()` : utiliser `jwt.verify()` au lieu de `jwt.decode()` | `src/core/utils/jwt.util.ts:14` |
| 8 | Remplacer `LocalStorage` par Redis pour le cache des permissions | `auth.service.ts:125`, `permission.service.ts:85` |
| 9 | Ajouter `@nestjs/throttler` sur l'endpoint `/login` et le resolver `authenticate` | `src/app/auth/` |
| 10 | Hasher les tokens de reset avant stockage en base | `auth.service.ts:176` |
| 11 | Corriger `map(async …)` → `mergeMap(async …)` dans les interceptors | `rest-logger.interceptor.ts:22`, `gql-logger.interceptor.ts:25` |
| 12 | Corriger le champ de log `request.user.login` → `request.user.username` | `rest-logger.interceptor.ts:42` |
| 13 | Ajouter `helmet` pour les headers de sécurité HTTP | `src/main.ts` |
| 14 | Ajouter `@IsEmail()` et `@MinLength(8)` sur le DTO de login | `src/app/auth/dto/auth.dto.ts` |

### P2 — Moyen terme (< 2 mois)

| # | Action | Fichier(s) |
|---|--------|------------|
| 15 | Mettre à jour les dépendances critiques : au minimum `puppeteer`, `mongoose`, `typeorm` | `package.json` |
| 16 | Migrer `tslint` → `eslint` + `@typescript-eslint` | config |
| 17 | Activer `"noImplicitAny": true` dans `tsconfig.json` et corriger les erreurs | `tsconfig.json` |
| 18 | Écrire les premiers tests unitaires (auth, guards, encryption, injections) avec objectif ≥ 60% coverage | `src/**/*.spec.ts` |
| 19 | Ajouter des limites de complexité et profondeur sur les requêtes GraphQL | `src/app/app.module.ts` |
| 20 | Supprimer `node-localstorage` et `ts-localstorage` après migration Redis | `package.json` |
| 21 | Planifier la migration NestJS 5 → 10 (chantier majeur, requiert une branche dédiée) | — |

---

*Rapport généré par audit statique manuel complet — 2026-03-29*
