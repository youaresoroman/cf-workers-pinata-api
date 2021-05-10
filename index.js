export default class {
  constructor(key, secret) {
    this.options = {
      method: "GET",
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
        "content-type": "application/json;charset=UTF-8",
      },
    };
  }

  async hashMetadata(hash, metadata) {
    let result = "OK";
    var options = {};
    options.headers = this.options.headers;
    options.method = "PUT";
    options.body = metadata;
    options.body["ipfsPinHash"] = hash;
    options.body = JSON.stringify(options.body);
    await fetch("https://api.pinata.cloud/pinning/hashMetadata", options)
      .then((response) => response.text())
      .then(function (data) {
        if (data != "OK" && typeof data != undefined) {
          try {
            result = JSON.parse(data);
          } catch (err) {
            console.log(err);
            result = {
              error: "Unknown",
            };
          }
        }
      });
    return result;
  }

  async unpin(
    hash
  ) {
    let result = {
      status: "OK",
    }
    var options = {};
    options.headers = this.options.headers;
    options.method = "DELETE";
    await fetch("https://api.pinata.cloud/pinning/unpin/" + hash, options)
      .then((response) => response.text())
      .then(function (data) {
        if (data != "OK" && typeof data != undefined) {
          const resp = JSON.parse(data);
          result = {
            status: "Error",
            message: resp.error,
          };
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return base64js.fromByteArray(result);
  }

  async getFile(hash) {
    let fileData;
    let fileType;

    await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
      .then((res) => res.text())
      .then((data) => {
        try {
          data = JSON.parse(data)
        } catch (err) {
          data = {}
        }
        if ("fileType" in data && "fileData" in data) {
          fileType = data.fileType;
          fileData = data.fileData;
        }
      });
    return fileType ? { fileType, fileData } : { error: "Not found" };
  }

  async pinFile(fileType, fileData, params) {
    return await this.pinJSON(
      {
        fileType,
        fileData,
      },
      params
    );
  }

  async pinJSONToIPFS(data, params = {}) {
    let result = {}
    var options = {};
    options.headers = this.options.headers;
    options.method = "POST";
    options.body = JSON.stringify({
      pinataMetadata: params,
      pinataContent: data,
    });
    await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", options)
      .then((response) => response.json())
      .then(function (data) {
        result = data;
      })
      .catch((err) => {
        console.log(err);
      });
    return result;
  }

  async pinList(params) {
    let result = "";
    var options = {};
    options.headers = this.options.headers;
    options.method = "GET";
    const query = Object.keys(params)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
    await fetch("https://api.pinata.cloud/data/pinList?" + query, options)
      .then((response) => response.json())
      .then((data) => {
        result = data.rows;
      })
      .catch((err) => {
        console.log(err);
      });
    return result;
  }
}
