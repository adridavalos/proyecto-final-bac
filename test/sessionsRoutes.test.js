import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:5000');
const testUser = { firstName: 'Ana', lastName: 'Perez', email: 'aperez@gmail.com', password: 'abc123'};
let cookie = {};

describe('Test Integración Users', function () {

    it('POST /api/sessions/register debe registrar un nuevo usuario', async function () {
        const {statusCode,}  = await requester.post('/api/sessions/register').send(testUser);
        expect(statusCode).to.be.equals(302);
    });

    it('POST /api/sessions/register NO debe volver a registrar el mismo mail', async function () {
         const { statusCode }  = await requester.post('/api/sessions/register').send(testUser);
        expect(statusCode).to.be.equals(400);
    });

    it('POST /api/sessions/login debe ingresar correctamente al usuario', async function () {
        const { statusCode }  = await requester.post('/api/sessions/login').send(testUser);
        expect(statusCode).to.be.equals(302);

    });it('POST /api/sessions/ghlogin debe ingresar correctamente al usuario', async function () {
        const { statusCode }  = await requester.post('/api/sessions/login').send(testUser);
        expect(statusCode).to.be.equals(302);
    });
    it('POST /api/sessions/login debe ingresar correctamente al usuario', async function () {
        const result  = await requester.post('/api/sessions/login').send(testUser);
        const cookieData = result.header['set-cookie'][0];
        cookie = {name: cookieData.split('=')[0], value:cookieData.split('=')[1]};

        expect(cookieData).to.be.ok;
        expect(cookie.name).to.be.equals('currentUser');
        expect(cookie.value).to.be.ok;
    })
    it('GET /api/sessions/current debe retornar datos correctos de usuario', async function () {
        const { _body } = await requester.get('/api/sessions/current').set('cookie', [`${cookie.name}=${cookie.value}`]);
        
        expect(_body.payload).to.have.property('firstName');
        expect(_body.payload).to.have.property('lastName');
        expect(_body.payload).to.have.property('role');        
        expect(_body.payload).to.have.property('email').and.to.be.eql(testUser.email);
    });
    
});