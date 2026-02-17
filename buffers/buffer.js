const buf = new Buffer.alloc(5, "a", 'ascii');

const stringBuf = new Buffer.from("I love Masha");
const bufCopy = new Buffer.from(buf);

 

console.log(buf.toString());
