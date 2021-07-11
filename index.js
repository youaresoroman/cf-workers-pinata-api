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

  handleResult(data) {
    return new Promise((resolve, reject) => {
      try {
        const resultData = JSON.parse(data);
        if (typeof resultData == "object" && resultData.rows || resultData.ipfsHash || resultData.count || resultData.IpfsHash) {
          resolve({
            status: "succeed",
            content: resultData
          })
        } else {
          reject({
            status: "failed",
            content: resultData.error ? resultData.error : resultData
          })
        }
      } catch (err) {
        if (typeof data == "string" && data == "OK") {
          resolve({
            status: "succeed",
            content: "OK"
          })
        } else {
          reject({
            status: "failed",
            content: data
          })
        }
      }
    })
  }

  async hashMetadata(hash, metadata) {
    return new Promise(async (resolve, reject) => {
      const options = {
        ...this.options,
        method: "PUT",
        body: JSON.stringify({
          ipfsPinHash: hash,
          keyvalues: metadata
        })
      }
      await fetch("https://api.pinata.cloud/pinning/hashMetadata", options)
        .then((response) => response.text())
        .then((data) => {
          this.handleResult(data)
            .then((result) => {
              resolve(result)
            })
            .catch((result) => {
              reject(result)
            })
        })
        .catch(() => {
          reject({
            status: "failed",
            content: "Connection failed"
          })
        });
    });
  }

  async unpin(hash) {
    return new Promise(async (resolve, reject) => {
      const options = {
        ...this.options,
        method: "DELETE"
      }
      await fetch("https://api.pinata.cloud/pinning/unpin/" + hash, options)
        .then((response) => response.text())
        .then((data) => {
          this.handleResult(data)
            .then((result) => {
              resolve(result)
            })
            .catch((result) => {
              reject(result)
            })
        })
        .catch(() => {
          reject({
            status: "failed",
            content: "Connection failed"
          })
        });
    });
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
    return new Promise(async (resolve, reject) => {
      await this.pinJSONToIPFS(
        {
          fileType,
          fileData,
        },
        params
      )
        //.then(async data => await data.json())
        .then(data => resolve(data))
        .catch(() => {
          reject({ error: "Upload fail" })
        })
    })
  }

  async pinJSONToIPFS(data, params = {}) {
    return new Promise(async (resolve, reject) => {
      const options = {
        ...this.options,
        method: "POST",
        body: JSON.stringify({
          pinataMetadata: params,
          pinataContent: data,
        })
      }
      await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", options)
        .then((response) => response.text())
        .then((data) => {
          this.handleResult(data)
            .then((result) => {
              resolve(result)
            })
            .catch((result) => {
              reject(result)
            })
        })
        .catch(() => {
          reject({
            status: "failed",
            content: "Connection failed"
          })
        });
    })
  }
}
