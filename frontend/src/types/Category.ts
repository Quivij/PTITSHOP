export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
}
export interface ApiCategoryResponse<T> {
    success: boolean;
    data: T;
    message: string;
}