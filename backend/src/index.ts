import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

// creating the main hono app 
const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string,
	}
}>();

// top level middleware
app.use(' api/v1blog/*', async ( c, next)=> {
  // get a header
  // verify the header
  // if the header is correct, we need can proceed
  // if not , we return the user a 403 status code

  const header = c.req.header("authrization") || "";
  // Bearer token => [ "Bearer", "token"]
  // const token = heder.split(" ")[1];

  await next();
})

app.post(' /api/v1/signup', async(c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  try{
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }
    });
    const jwt = await sign ( {id: user.id}, c.env.JWT_SECRET);
    return c.json({jwt});
  } catch(e){
    c.status(403);
    return c.json({ error: "error while signing up"});
  }

})
app.post('  /api/v1/signin', async(c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,

  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    }
  });

  if(!user){
    c.status(403);
    return c.json({ error: "user not found "});
  }

  const jwt = await sign({ id: user.id}, c.env.JWT_SECRET);
  return c.json( { jwt });
})
app.post(' /api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.put(' /api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

export default app



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMTUyYTFkZTctMzliZi00ZGQ2LTg0ZWYtM2Q5YjVmM2I5OTYwIiwidGVuYW50X2lkIjoiMDEzNGNhMTE5MDU1OTI3NmY1ZTE5YmFiNDM2OTQxNmE3MjI5OWM4M2E4NzRkOWRjMDc5ZjNiYzgzOWE5NzU4YyIsImludGVybmFsX3NlY3JldCI6IjFiOTEwMzU2LWIxNTktNGIxOS05YTQwLTE3ZTIwN2VlZGM3NSJ9.18cyd-uePY6iK2HQcSBizb7vsYaZHOLnlQXbIqLNyAM


// DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiNGViMzE4NjItMWE1Ni00ZjdmLWI0YzgtYTU3NGQwZWE3OGU5IiwidGVuYW50X2lkIjoiMDEzNGNhMTE5MDU1OTI3NmY1ZTE5YmFiNDM2OTQxNmE3MjI5OWM4M2E4NzRkOWRjMDc5ZjNiYzgzOWE5NzU4YyIsImludGVybmFsX3NlY3JldCI6IjFiOTEwMzU2LWIxNTktNGIxOS05YTQwLTE3ZTIwN2VlZGM3NSJ9.0RapyXsVLvZRYGW0g0DJqC1uDAO60yuMYUjIbJ86sxM"