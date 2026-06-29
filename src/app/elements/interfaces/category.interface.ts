export interface Category {
    id?: number;
    name?: string;
    icon?: string;
    parentCategoryId?: number;
    parentCategory?: Category;
    childrenCategories?: Category[];
}