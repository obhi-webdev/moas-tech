import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "./product.crud.service.js";

import {
  createProductSchema,
  updateProductSchema,
  validateProductInput,
} from "./product.crud.validation.js";

export async function createProductHandler(req, res, next) {
  try {
    const dto = validateProductInput(
      createProductSchema,
      req.body
    );

    const product = await createProduct(dto);

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProductHandler(req, res, next) {
  try {
    const dto = validateProductInput(
      updateProductSchema,
      req.body
    );

    const product = await updateProduct(
      req.params.id,
      dto
    );

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProductHandler(req, res, next) {
  try {
    const result = await deleteProduct(req.params.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
