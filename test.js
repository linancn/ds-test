
const { sign } = require('./sm2');
const { encode,decode } = require('@msgpack/msgpack/')
const axios = require('axios');
require('dotenv').config();

//写明文交易
const writePlain=async (msg)=>{

    const date=new Date();
    const curTimestamp = date.getTime();
    // const userId =user.user_id;
    const userId = Number(process.env.USER_ID);
    //1 构造WriteInfo
    const WriteInfo = {
        UserID: userId,
        Info: msg,
        Hash: "",
        Acl: [""]
    }

    const winfoData = encode(WriteInfo);
    const uid =  userId.toString();
    //2 将WriteInfo序列化后生成op 构造第二层WriteRequest
    const wreq = { wType: 0, UID: uid, OP: Buffer.from(winfoData) }
    const wreqData = encode(wreq);
    //3 WriteRequest序列化后组装为ClientRequest的OP
    const clientReq = {
        Type: 7,
        ID: userId,
        OP: wreqData,
        TS: curTimestamp,
    }
    //4 将ClientRequest序列化后生成msg msg签名得到sig进行传输
    const clientReqData = encode(clientReq);
    const signature = sign(Array.prototype.slice.call(clientReqData), process.env.PRIVATE_KEY);

    const baseReqData = Buffer.from(clientReqData).toString('base64');
    const baseSignature = Buffer.from(signature,'HEX').toString('base64');
    const payload = {
        "msg": baseReqData,
        "version": 0, // 序列化 clientRequest 之后，msg的base64编码值
        "sig":baseSignature // 前端对msg签名之后，签名值的base64编码值
    }

    try {
        fetch(`${process.env.URL}/functionAPI/signedRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(result => {
                console.log('Server response:', result);
            })
            .catch(err => {
                console.error(err);
            });
    } catch (err) {
        console.error('发送失败,', err);
    }

}

//写密文交易
// const writePlain=(e)=>{

//     if(msg ===''){
//         setError(true);
//         return ;
//     }

//     T.loading("正在提交...");

//     setError(false);
//     const date=new Date();
//     const curTimestamp = date.getTime();
//     const tdh2pubkey =atob(user.tdh2_pubkey);
//     const pub = JSON.parse(tdh2pubkey)
//     const key = user.key;
//     const pubkey = user.publicKey;


//     const userId = user.user_id;
//     const result = encrypt(pub, msg)
//     const hash_C = sm3Fun(result.ctxt)
//     const hash_C_str = hash_C.toString('base64')
//     const otherPublic = state.selectOption?.map(obj => obj.value)|| [];
//     const WriteInfo = {
//         UserID: userId,
//         Info: result.jsonString,
//         Hash: hash_C_str,
//         Acl: [pubkey,...otherPublic]
//     }

//     const winfoData = encode(WriteInfo)
//     const uid =  userId.toString();

//     const wreq = { WType: 1, UID: uid, OP: Buffer.from(winfoData) }

//     const wreqData = encode(wreq)

//     const clientReq = {
//         Type: 7,
//         ID: userId,
//         OP: Buffer.from(wreqData),
//         TS: curTimestamp,
//     }
//     const clientReqData = encode(clientReq)
//     const signature = sign(Array.prototype.slice.call(clientReqData), key)
//     const baseReqData = Buffer.from(clientReqData).toString('base64')
//     const baseSignature = Buffer.from(signature, 'HEX').toString('base64')

//     const form = {
//         "user_id": userId,
//         "pubkey": pubkey,
//         "req_data": baseReqData, // 序列化 clientRequest 之后，msg的base64编码值
//         "signature": baseSignature, // 前端对msg签名之后，签名值的base64编码值
//         "acl": WriteInfo.Acl, // 可访问密文的公钥列表
//         "clittle": result.jsonString, // 计算过程中生成的小c
//         "cipher": Buffer.from(result.ctxt, 'hex').toString('base64'), // 计算过程中生成的大C
//         "hash_cipher": hash_C_str, // cipher 的sm3哈希值
//     }


//     writePlainRequest.run({...form}).then(
//         res => {
//             T.loaded();
//             setState({...state,selectOption:[]})
//             if (res.code === 0) {
//                 console.log('交易id',res);
//                 prompt.inform('发送成功!');
//                 setMsg('');
//             }else{
//                 prompt.error('发送失败!' +res.cnMsg,false);
//             }
//         },
//         err=>{
//             console.log('发送失败,',err);
//             T.loaded();
//         }
//     )

// }

const response = writePlain('hello world');
console.log(response);