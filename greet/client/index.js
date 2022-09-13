const grpc = require('@grpc/grpc-js');
const {GreetServiceClient} = require('../proto/greet_grpc_pb');
const {GreetRequest} = require('../proto/greet_pb');
const {greetWithDeadline} = require('../server/service_impl');

function doGreet(client) {
  console.log('doGreet was invoked');

  const req = new GreetRequest()
    .setFirstName('Michael');

  client.greet(req, (error, response) => {
    if (error) {
      return console.error(error);
    }

    console.log(`Greet ${response.getResult()}`)
  })
}

function doGreetManyTimes(client) {
  console.log('doGreetManyTimes was invoked');

  const req = new GreetRequest()
    .setFirstName('Michael');

  const call = client.greetManyTimes(req);

  call.on('data', (res) => {
    console.log(`GreetManyTimes ${res.getResult()}`)
  })
}

function doLongGreet(client) {
  console.log('doLongGreet was invoked');

  const names = ['Michael', 'Megan', "Test"];
  const call = client.longGreet((err, res) => {
    if(err) {
      return console.error(err);
    }

    console.log(`LongGreet ${res.getResult()}`)
  });

  names.map(name => new GreetRequest().setFirstName(name)).forEach(req => call.write(req));

  call.end();
}

function doGreetEveryone(client) {
  console.log('doGreetEveryone was invoked');

  const names = ['Michael', 'Megan', "Test"];
  const call = client.greetEveryone();

  call.on('data', (res) => {
    console.log(`GreetEveryone: ${res.getResult()}`)
  });

  names.map(name => new GreetRequest().setFirstName(name)).forEach(req => call.write(req));

  call.end();
}

function doGreetWithDeadline(client, mils) {
  console.log('doGreetWithDeadline was invoked');

  const request = new GreetRequest().setFirstName('DeadlineDan');

  client.greetWithDeadline(request, {
    deadline: new Date(Date.now() + mils)
  }, (err, res) => {
    if(err) {
      return console.error(err);
    }

    console.log(`GreetWithDeadline ${res.getResult()}`)
  })
}

function main() {
  const creds = grpc.ChannelCredentials.createInsecure();
  const client = new GreetServiceClient('localhost:50051', creds);

  doGreet(client);
  doGreetManyTimes(client);
  doLongGreet(client);
  doGreetEveryone(client);
  doGreetWithDeadline(client, 5000);
  doGreetWithDeadline(client, 2000);

  client.close();
}

main();
