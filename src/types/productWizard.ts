import { ProductForm } from "./productForm";

export type StepProps = {
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
};