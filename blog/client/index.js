const grpc = require('@grpc/grpc-js');
const {BlogServiceClient} = require('../proto/blog_grpc_pb');
const {Blog, BlogId} = require('../proto/blog_pb');

function createBlog(client) {
  console.log('Create Blog was invoked');

  return new Promise((resolve, reject) => {
    const req = new Blog()
      .setAuthorId('Clement')
      .setTitle('My First Blog')
      .setContent('Ionic cannon, procedure, and peace. Yo-ho-ho, ye scrawny mainland- set sails for grace!');

    client.createBlog(req, (err, res) => {
      if (err) {
        reject(err)
      }

      console.log('blog was created', res);
      resolve(res.getId());
    });
  });
}

async function main() {
  const creds = grpc.ChannelCredentials.createInsecure();
  const client = new BlogServiceClient('localhost:50051', creds);

  const id = await createBlog(client);

  client.close();
}

main();
