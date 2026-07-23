export interface CategoryDTO {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
}
