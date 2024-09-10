import { faker } from "@faker-js/faker";

export const generateMockProducts = async (qty) =>{
  const products = [];
  for (let i = 0; i < qty; i++) {
    products.push({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      thumbnail: faker.image.url(),
      code: faker.string.alphanumeric(10),
      stock: faker.number.int({ min: 0, max: 100 }),
      status: faker.datatype.boolean(),
      category: faker.number.int({ min: 1, max: 10 }),
    });
  }
  return products;
}
