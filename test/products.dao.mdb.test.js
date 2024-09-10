import chai from 'chai';
import mongoose from 'mongoose';
import ProductDAO from '../src/services/products.dao.mdb.js';
const connection = await mongoose.connect('mongodb://localhost:27017/ecommerce');
const dao = new ProductDAO();
const expect = chai.expect;

const tesrProduct ={
    title: "Producto test",
      description: "Descripción del producto 1",
      price: 29.99,
      thumbnail: "http://example.com/thumbnail1.jpg",
      code: "P001",
      stock: 10,
      status: true,
      category: 1,
      owner: "66c777fb81255f42418e7097"};

var testId = '';

describe('Test DAO Products',function(){

    before(function () {
        mongoose.connection.collections.products.drop();
    });

    it('getAll() debe retornar un array de producto', async function () {
        const result = await dao.getAll();
        expect(result).to.be.an('array');
    });
    it('add() debe retornar un objeto con los datos del nuevo producto', async function () {
        const result = await dao.add(tesrProduct);
        testId = result._id.toString();
        
        expect(result).to.be.an('object');
        expect(result._id).to.be.not.null;
    });
    it('getById() debe retornar un objeto coincidente con el criterio indicado', async function () {

        const result = await dao.getById(testId);
        expect(result).to.be.an('object');
    
        expect(result._id).to.be.not.null;
        expect(result._id.toString()).to.be.equal(testId);
    
        expect(result.title).to.be.equal('Producto test');
        expect(result.description).to.be.equal('Descripción del producto 1');
        expect(result.price).to.be.equal(29.99);
        expect(result.thumbnail).to.be.equal('http://example.com/thumbnail1.jpg');
        expect(result.code).to.be.equal('P001');
        expect(result.stock).to.be.equal(10);
        expect(result.status).to.be.true;
        expect(result.category).to.be.equal(1);
    });
    it('update() debe retornar un objeto con los datos modificados', async function () {
        const modifiedDescription = 'Descripcion Modificado desde el test';
        const result = await dao.update({ _id: testId }, { description: modifiedDescription },{ new: true });

        expect(result).to.be.an('object');
    
        expect(result._id).to.be.not.null;
        expect(result._id.toString()).to.be.equal(testId);
    
        expect(result.title).to.be.equal('Producto test');
        expect(result.description).to.be.equal(modifiedDescription);
        expect(result.price).to.be.equal(29.99);
        expect(result.thumbnail).to.be.equal('http://example.com/thumbnail1.jpg');
        expect(result.code).to.be.equal('P001');
        expect(result.stock).to.be.equal(10);
        expect(result.status).to.be.true;
        expect(result.category).to.be.equal(1);
    });
    it('delete() debe borrar definitivamente el documento indicado', async function () {
        const result = await dao.delete(testId);

        expect(result).to.be.an('object');
        expect(result._id.toString()).to.be.equal(testId);
    });

});