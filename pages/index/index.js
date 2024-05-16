// index.js
import  {request}  from '../../encode'


request({
   method: 'POST',
   path: '/jdyconnector/app_management/push_app_authorize',
   params: { outerInstanceId: "267037843258478592" }
}).then(res => {
   console.log(res, 'res:')
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
