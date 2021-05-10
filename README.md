![NPM](https://img.shields.io/npm/l/cf-workers-pinata-api) ![npm](https://img.shields.io/npm/dm/cf-workers-pinata-api) ![npm](https://img.shields.io/npm/v/cf-workers-pinata-api)


<img src="https://cdn-images-1.medium.com/max/1200/1*BTGStLRXsQUbkp0t-oxJhQ.png" width="200" />
<img src="https://workers.cloudflare.com/resources/logo/logo.svg" width="200" />

# cf-workers-pinata-api

## Overview
> This project is in dev process and may not ready for production! Pull requests are most welcome!

Pinata API wrapper class for Cloudflare Workers

https://www.npmjs.com/package/cf-workers-pinata-api

## Installation
```
npm install --save cf-workers-pinata-api
```

## Setup
To start, simply import the cf-workers-pinata-api and set up an instance with your Pinata API Keys. Don't know what your keys are? Check out your [Account Page](https://pinata.cloud/account).

```javascript
import pinataAPI from 'cf-workers-pinata-api';
const pinata = pinataAPI('yourPinataApiKey', 'yourPinataSecretApiKey');
```

## Usage
Once you've set up your instance, using the cf-workers-pinata-api as easy as Pinata SDK. Simply call your desired function and handle the results.
Full list of available Pinata API Endpoints is here https://pinata.cloud/documentation

* Pinning
  * [hashMetadata](#hashMetadata-anchor)
  <!-- * [hashPinPolicy](#hashPinPolicy-anchor)
  * [pinByHash](#pinByHash-anchor)
  * [pinFileToIPFS](#pinFileToIPFS-anchor)
  * [pinFromFS](#pinFromFS-anchor)
  * [pinJobs](#pinJobs-anchor) -->
  * [pinJSONToIPFS](#pinJSONToIPFS-anchor)
  * [unpin](#unpin-anchor)
  <!-- * [userPinPolicy](#userPinPolicy-anchor) -->

* Data
  <!-- * [testAuthentication](#testAuthentication-anchor) -->
  * [pinList](#pinList-anchor)
  <!-- * [userPinnedDataTotal](#userPinnedDataTotal-anchor) -->
<br />


<a name="hashMetadata-anchor"></a>
### `hashMetadata`
Allows the user to change the name and keyvalues associated with content pinned to Pinata.
Changes made via this endpoint only affect the metadata for the hash passed in. [Metadata](#metadata-anchor) is specific to Pinata and does not modify the actual content stored on IPFS in any way. It is simply a convenient way of keeping track of what content you have stored.

##### `pinata.hashMetadata(ipfsPinHash, metadata)`
##### Params
* `ipfsPinHash` - A string for a valid IPFS Hash that you have pinned on Pinata.
* `metadata` A JSON object containing the following:
  * `name` (optional) - A new name that Pinata will associate with this particular hash. 
  * `keyvalues` (optional) - A JSON object with the updated keyvalues you want associated with the hash provided (see more below)
  
###### Adding or modifying keyvalues
To add or modify existing keyvalues, simply provide them in the following format for the keyvalues object:
```
keyvalues: {
    newKey: 'newValue', //this adds a keyvalue pair
    existingKey: 'newValue' //this modifies the value of an existing key if that key already exists
}
```

###### Removing keyvalues
To remove a keyvalue pair, simply provide null as the value for an existing key like so:
```
keyvalues: {
    existingKeyToRemove: null //this removes a keyvalue pair
}
```

#### Response
If the operation is successful, you will receive back an "OK" REST 200 status.

##### Example Code
```javascript
const metadata = {
    name: 'new custom name',
    keyvalues: {
        newKey: 'newValue',
        existingKey: 'newValue',
        existingKeyToRemove: null
    }
};
const result = await pinata.hashMetadata('yourHashHere', metadata);
console.log(result);
```
<a name="pinJSONToIPFS-anchor"></a>
### `pinJSONToIPFS`
Send JSON to to Pinata for direct pinning to IPFS.

##### `pinata.pinJSONToIPFS(body, options)`
##### Params
* `body` - Valid JSON you wish to pin to IPFS
* `options` (optional): A JSON object that can contain the following keyvalues:
  * `metadata` (optional): A JSON object with [optional metadata](#metadata-anchor) for the hash being pinned
  * `pinataOptions` (optional): A JSON object with additional [options](#metadata-anchor) for the JSON being pinned
#### Response
```
{
    IpfsHash: This is the IPFS multi-hash provided back for your content,
    PinSize: This is how large (in bytes) the content you just pinned is,
    Timestamp: This is the timestamp for your content pinning (represented in ISO 8601 format)
}
```
##### Example Code
```javascript
const body = {
    message: 'Pinatas are awesome'
};
const options = {
    pinataMetadata: {
        name: MyCustomName,
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
    },
    pinataOptions: {
        cidVersion: 0
    }
};

const result = await pinata.pinJSONToIPFS(body, options);
console.log(result);
```

<a name="unpin-anchor"></a>
### `unpin`
Have Pinata unpin content that you've pinned through the service.

##### `pinata.unpin(hashToUnpin)`
##### Params
* `hashToUnpin` - the hash of the content you wish to unpin from Pinata
#### Response
If the operation is successful, you will simply receive "OK" as your result
##### Example Code
```javascript
const result = await pinata.unpin(hashToUnpin);
console.log(result);
```

<a name="pinList-anchor"></a>
### `pinList`
Retrieve pin records for your Pinata account

##### `pinata.pinList(filters)`
##### Params
* `filters` (optional): An object that can consist of the following optional query parameters:
  * `hashContains` (optional): A string of alphanumeric characters that desires hashes must contain
  * `pinStart` (optional): The earliest date the content is allowed to have been pinned. Must be a valid [ISO_8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) date. 
  * `pinEnd` (optional): The earliest date the content is allowed to have been pinned. Must be a valid [ISO_8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) date. 
  * `unpinStart` (optional): The earlist date the content is allowed to have been unpinned. Must be a valid [ISO_8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) date. 
  * `unpinEnd` (optional): The latest date the content is allowed to have been unpinned. Must be a valid [ISO_8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) date. 
  * `pinSizeMin` (optional): The minimum byte size that pin record you're looking for can have
  * `pinSizeMax` (optional): The maximum byte size that pin record you're looking for can have
  * `status` (optional): Filter pins using one of the following options
    * `'all'` (Records for both pinned and unpinned content will be returned)
    * `'pinned'` (Only records for pinned content will be returned)
    * `'unpinned'` (Only records for unpinned content will be returned)
  * `pageLimit` (optional): Limit the amount of results returned per page of results (default is 10, and max is 1000)
  * `pageOffset` (optional): Provide the record offset for records being returned. This is how you retrieve records on additional pages (default is 0)
   * `metadata` (optional): A JSON object that can be used to find records for content that had optional metadata included when it was added to Pinata. The metadata object is formatted as follows:
 
##### Metadata filter object formatting
```
{
    name: 'exampleName',
    keyvalues: {
        testKeyValue: {
            value: 'exampleFilterValue',
            op: 'exampleFilterOperation'
        },
        testKeyValue2: {
            value: 'exampleFilterValue2',
            op: 'exampleFilterOperation2'
        }
    }
}
```
Filter explanations:
* `name` (optional): If provided, any records returned must have a name that contains the string provided for the 'name'.
* `keyvalues` (optional): Each keyvalue provided in this object have both a `value` and `op`
  * `value` (required): This is the value which will be filtered on
  * `op` (required): This is the filter operation that will be applied to the `value` that was provided. Valid op values are:
     * `'gt'` (greater than the value provided)
     * `'gte'` (greater than or equal to the value provided)
     * `'lt'` (less than the value provided)
     * `'lte'` (less than or equal to the value provided)
     * `'ne'` (not equal to the value provided)
     * `'eq'` (equal to the value provided)
     * `'between'` (between the two values provided) - NOTE - This also requires a `secondValue` be provided as seen in the example below
     * `'notBetween'` (not between the two values provided) - NOTE - This also requires a `secondValue` be provided as seen in the example below
     * `'like'` (like the value provided)
     * `'notLike'` (not like the value provided)
     * `'iLike'` (case insensitive version of `like`)
     * `'notILike'` (case insensitive version of `notLike`)
     * `'regexp'` (filter the value provided based on a provided regular expression)
     * `'iRegexp'` (case insensitive version of regexp)
  
As an example, the following filter would only find records whose name contains the letters 'invoice', have the metadata key 'company' with a value of 'exampleCompany', and have a metadata key 'total' with values between 500 and 1000:
```
{
    name: 'invoice',
    keyvalues: {
        company: {
            value: 'exampleCompany,
            op: 'eq'
        },
        total: {
            value: 500,
            secondValue: 1000,
            op: 'between'
        }
    }
}
```


 
#### Response
```
{
    count: (this is the total number of pin records that exist for the query filters you passed in),
    rows: [
        {
            id: (the id of your pin instance record),
            ipfs_pin_hash: (the IPFS multi-hash for the content you pinned),
            size: (this is how large (in bytes) the content pinned is),
            user_id: (this is your user id for Pinata),
            date_pinned: (This is the timestamp for when this content was pinned - represented in ISO 8601 format),
            date_unpinned: (This is the timestamp for when this content was unpinned (if null, then you still have the content pinned on Pinata),
            metadata: {
                name: (this will be the name of the file originally upuloaded, or the custom name you set),
                keyvalues: {
                    exampleCustomKey: "exampleCustomValue",
                    exampleCustomKey2: "exampleCustomValue2",
                    ...
                }
            }
        },
        {
            same record format as above
        }
        .
        .
        .
    ]
}
```
##### Example Code
```javascript
const metadataFilter = {
    name: 'exampleName',
    keyvalues: {
        testKeyValue: {
            value: 'exampleFilterValue',
            op: 'exampleFilterOperation'
        },
        testKeyValue2: {
            value: 'exampleFilterValue2',
            op: 'exampleFilterOperation2'
        }
    }
};

const filters = {
    status : 'pinned',
    pageLimit: 10,
    pageOffset: 0,
    metadata: metadataFilter
};
const result = await pinata.pinList(filters);
console.log(result);
```
