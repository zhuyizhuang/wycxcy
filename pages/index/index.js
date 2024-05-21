// index.js
import  {request}  from '../../encode'
import {getToken} from '../../getAppToken'


request({
   method: 'delete',
   path: '/jdy/test/delete',
   params: { outerInstanceId: "267037843258478592" }
}).then(res => {
    console.log(res);
})

Page({
  data :{
    qrcodeResult:''
  },
  scanQrcode :function(){
    var that  = this;
    wx.scanCode({
      onlyFromCamera:true,
      success : function(res){
        that.setData({
          qrcodeResult :res.result
        })
      }
    })
  }
})
