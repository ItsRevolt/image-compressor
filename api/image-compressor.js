const sharp = require("sharp");
var AWS = require("aws-sdk");
var s3Bucket = new AWS.S3({
  endpoint: "nyc3.digitaloceanspaces.com",
  region: "nyc3",
  params: {
    Bucket: "tely-bucket"
  }
});

var nanoid = require("nanoid");

async function s3Upload(input, key) {
  var params = {
    Key: key,
    Body: input,
    ContentType: "image/jpg",
    ACL: "public-read"
  };
  let uploaded = await s3Bucket.upload(params).promise();
  if (uploaded) {
    return "https://tely-bucket.nyc3.cdn.digitaloceanspaces.com/" + key;
  }
}

async function compress(imgBuffer) {
  var image = Buffer.from(imgBuffer, "base64");
  const data = await sharp(image)
    .resize(140, 140)
    .jpeg()
    .toBuffer();
  console.log(data);
  return data;
}

module.exports = async (req, res) => {
  const { body } = req;
  console.log(body);
  var compressed = await compress(
    //body.file.replace(/^data:image\/\w+;base64,/, "")
    body.file
  );
  var upload = await s3Upload(compressed, body.key + "-" + nanoid());
  return res.status(200).send(upload);
};
