const grpc = require('@grpc/grpc-js');
const {BlogServiceClient} = require('../proto/blog_grpc_pb');
const {Blog, BlogId} = require('../proto/blog_pb');
const {Empty} = require('google-protobuf/google/protobuf/empty_pb');

function createBlog(client, author, title, content) {
  console.log('Create Blog was invoked');

  return new Promise((resolve, reject) => {
    const req = new Blog()
      .setAuthorId(author)
      .setTitle(title)
      .setContent(content);

    client.createBlog(req, (err, res) => {
      if (err) {
        reject(err)
      }

      console.log(`blog was created ${res}`);
      resolve(res.getId());
    });
  });
}

function readBlog(client, id) {
  console.log('readBlog was invoked');

  return new Promise((resolve, reject) => {
    const req = new BlogId().setId(id);

    client.readBlog(req, (err, res) => {
      if (err) {
        reject(err);
      }

      console.log(`Blog as read: ${res}`);
      resolve();
    })
  })
}

function updateBlog(client, id) {
  console.log('updateBlog was invoked');

  return new Promise((resolve, reject) => {
    const req = new Blog()
      .setId(id)
      .setAuthorId('New Author')
      .setTitle('New Titlte')
      .setContent('Whisk each side of the strawberries with half a kilo of popcorn.');

    client.updateBlog(req, (err, _) => {
      if (err) {
        reject(err);
      }

      console.log(`Blog was updated`);
      resolve();
    })
  })
}

function listBlogs(client) {
  console.log('listBlogs was invoked');

  return new Promise((resolve, reject) => {
    const req = new Empty();
    const call = client.listBlogs(req);

    call.on('data', (result) => {
      console.log(result);
    });

    call.on('error', (err) => reject(err));

    call.on('end', () => resolve());
  })
}

async function main() {
  const creds = grpc.ChannelCredentials.createInsecure();
  const client = new BlogServiceClient('localhost:50051', creds);

  const id = await createBlog(client, 'Michael', 'This is a test', 'Skulls are the parrots of the cold life.');
  await readBlog(client, id);
  await updateBlog(client, id);
  await listBlogs(client);

  client.close();
}

main();
