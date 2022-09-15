const grpc = require('@grpc/grpc-js')
const {Blog, BlogId} = require('../proto/blog_pb');
const {ObjectID} = require('mongodb');
const {Empty} = require('google-protobuf/google/protobuf/empty_pb');

function blogToDocument(blog) {
  return {
    author_id: blog.getAuthorId(),
    title: blog.getTitle(),
    content: blog.getContent()
  }
}

const internal = (err, callback) => callback({
  code: grpc.status.INTERNAL,
  message: err.toString()
});

function checkNotAcknowledged(res, callback) {
  if (!res.acknowledged) {
    callback({
      code: grpc.status.INTERNAL,
      message: 'Operation was not acknowledged'
    })
  }
}

function checkOID(id, callback) {
  try {
    return new ObjectID(id);
  }catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: 'invalid OID'
    })
  }
}

function checkNotFound(res, callback) {
  if (!res || res.matchedCount == 0) {
    callback({
      code: grpc.status.NOT_FOUND,
      message: 'Could not find blog'
    })
  }
}

exports.createBlog = async (call, callback) => {
  const data = blogToDocument(call.request);

  await collection.insertOne(data).then(res => {
    checkNotAcknowledged(res, callback);

    const id = res.insertedId.toString();
    const blogId = new BlogId().setId(id);

    callback(null, blogId);
  }).catch(err => internal(err, callback));
}

function documentToBlog(document) {
  return new Blog()
    .setId(document._id.toString())
    .setAuthorId(document.author_id)
    .setTitle(document.title)
    .setContent(document.content);
}

exports.readBlog = async (call, callback) => {
  const oid = checkOID(call.request.getId(), callback);

  await collection.findOne({_id: oid}).then(res => {
    checkNotFound(res, callback);
    
    callback(null, documentToBlog(res));
  }).catch(error => internal(error, callback));
}

exports.updateBlog = async (call, callback) => {
  const oid = checkOID(call.request.getId(), callback);

  await collection.updateOne({_id: oid}, {$set: blogToDocument(call.request)}).then(res => {
    checkNotFound(res, callback);
    checkNotAcknowledged(res, callback);

    callback(null, new Empty());
  }).catch(error => internal(error, callback));
}

exports.deleteBlog = async (call, callback) => {
  const oid = checkOID(call.request.getId(), callback);

  await collection.deleteOne({_id: oid}).then(res => {
    checkNotFound(res, callback);
    checkNotAcknowledged(res, callback);

    callback(null, new Empty());
  }).catch(error => internal(error, callback));
}

exports.listBlogs = async (call, callback) => {
  await collection.find()
    .map(doc => documentToBlog(doc))
    .forEach(blog => call.write(blog))
    .then(() => call.end())
    .catch(err => call.destroy({
      code: grpc.status.INTERNAL,
      message: 'Could not list blogs'
    }))
}
