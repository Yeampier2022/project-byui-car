const supertest = require('supertest');
const index = require('../index'); 


test('POST /users creates a new user with valid data', async () => {
  
  const newUser = {  
      name: 'Jessica',
      lname: 'Terry',
      email: 'terryj@yahoo.com',
      rol: 'admin', 
      githubId: '',
      avatarUrl: '',
      registeredDate: ''
    };

    const response = await request(index)
      .post('/users')
      .send(newUser);

    expect(response.statusCode).toBe(201); // Expect "Created" status code
    expect(response.header('Content-Type')).toContain('application/json'); 
    
  });


