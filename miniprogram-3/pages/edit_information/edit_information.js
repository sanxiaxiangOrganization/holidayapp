// pages/information/information.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName:wx.getStorageSync('nickName'),//wx.getStorageSync('userName'),
    phoneNumber:wx.getStorageSync('phoneNumber'),//wx.getStorage('phoneNumber'),
    userPic:wx.getStorageSync('userPic'),//wx.getStorageSync('userPic'),//用户头像
    clickPencil1:false,//如果点击小铅笔1，表示用户要修改昵称，则显示这个模块
    clickPencil2:false,//如果点击小铅笔2，表示用户要修改手机号，则显示这个模块
  },
  /*修改头像处理函数*/
  headHandler(){
    var that=this;
  wx.chooseImage({
    complete: (res) => {},
    fail: (res) => {},
    sizeType: ['compressed','original'],
    sourceType: ['album','camera'],
    success: (result) => {
      console.log("选择图片成功："+result)
      const FilePaths = result.tempFilePaths[0];
      console.log("tempFilePaths: "+FilePaths)
     

      //调用接口获取永久url
      wx.uploadFile({
        filePath: result.tempFilePaths[0],
        name: 'file',
        url: 'http://8.134.128.39:8080/vegetable/upload_file',// 上传图片的接口地址
        formData: {
        // 其他要随文件一起提交的表单信息
      },
      success(res) {
        console.log('获取永久url请求成功:', res.data);
        //console.log("res.data的类型： ")
        //console.log(typeof res.data); // 输出 'string'

        //因为它tm是个字符串，所以把它五马分尸！！
          res.data = JSON.parse(res.data);
        
          console.log("uploadRes.data.data: "+res.data.data); // 现在应该输出URL
        
        
        that.setData({
          userPic:res.data.data
        })    
        console.log("userPic: "+res.data.data)
          var userPic=res.data.data;
          wx.setStorageSync('userPic', res.data.data)


         //调用接口将更新后的用户信息保存到服务器
        wx.request({
          url: '', // 更新用户(头像）的接口地址？？？？？？？？？？？？？？？？？？？？？？？？？
          method: 'PUT',
          data:{
            "username":wx.getStorageSync('nickName'), 
            "userPic":userPic, 
           
          },
          header: {
            'Authorization':wx.getStorageSync('token'),
          },
          success(res) {
            console.log('更新用户头像请求成功:', res.data);
            
           
          },
          fail(err) { 
            console.error('更新用户头像请求失败:', err);
          }
        
        })
      },
      fail(err) { 
        console.error('获取永久url请求失败:', err);
      }
      
    })
  },
  fail(err) { 
    console.error('选择图片请求失败:', err);
  }
})
  },


/*修改昵称处理函数*/
  pencilHandler1(){
    this.setData({
      clickPencil1:true
     })
  }
  ,
  /*修改个性签名处理函数*/
  pencilHandler2(){
   this.setData({
    clickPencil2:true
   })
  }
    ,
  cancelHandler(){
    this.setData({
      clickPencil1:false,
      clickPencil2:false
     })
  },
  /*输入处理函数*/
  inputHandler(e){
    /*先将用户输入的内容保存下来 */
    wx.setStorageSync('inputValue', e.detail.value)
  }
  ,
  confirmHandler(){
    var that=this;
    var app=getApp();
    /*如果是修改昵称*/
    if(that.data.clickPencil1==true){
      this.setData({
        userName:wx.getStorageSync('inputValue')
      })
     app.globalData.userName=wx.getStorageSync('inputValue');
      /*检查是否修改成功 */
     console.log("修改后的昵称：",app.globalData.userName);
     //将修改后的昵称保存到本地——快
     wx.setStorageSync('nickName',wx.getStorageSync('inputValue'));

    }
     /*如果是修改手机号*/
     else{
      this.setData({
        phoneNumber:wx.getStorageSync('inputValue')
      })
      app.globalData.phoneNumber=wx.getStorageSync('inputValue');
       /*检查是否修改成功 */
     console.log("修改后的手机号：",app.globalData.phoneNumber);
     wx.setStorageSync('phoneNumber',wx.getStorageSync('inputValue'));
     }
     
     /*调用更新游客的接口将用户更新的东西放到数据库中*/
        wx.request({
          url: 'http://localhost:8080/tourist/update', // 更新游客的接口
          method: 'PUT',
          data:{
            "tourist_id": wx.getStorageSync('tourist_id'), 
            "tourist_name":wx.getStorageSync('nickName'), 
            "tourist_password":"123456",//默认123456 
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            console.log('更新用户信息成功:', res.data);
            
           
          },
          fail(err) { 
            console.error('更新用户信息请求失败:', err);
          }
        
        })
      
     /*无论是修改什么，最后都应该回到原来的视图，并进行重新渲染 */
     this.setData({
      clickPencil1:false,
      clickPencil2:false
     })
  },
  //绑定手机号处理函数
  getPhoneNumber(e) {
    console.log("————————————————————————————绑定手机号——————————————————————————");
    console.log("手机号信息", e);
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      // 用户同意授权
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log("登录成功，code:", res.code);

            // 发送 code、encryptedData、iv 到后端解密
            wx.request({
              url: "https://your-backend.com/api/decryptPhoneNumber",
              method: "POST",
              data: {
                code: res.code, // 登录凭证
                encryptedData: e.detail.encryptedData, // 加密的手机号数据
                iv: e.detail.iv, // 解密向量
              },
              success: (response) => {
                console.log("手机号解密结果:", response.data);
                this.setData({
                  phoneNumber: response.data.phoneNumber, // 绑定手机号
                });
                wx.showToast({
                  title: "手机号绑定成功",
                  icon: "success",
                });
              },
              fail: (err) => {
                console.error("手机号解密失败", err);
              },
            });
          }
        },
      });
    } else {
      console.log("用户拒绝授权手机号", e.detail.errMsg);
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app=getApp();
    app.getUserByOpenid(wx.getStorageSync('openid'))
    this.setData({
      userName:wx.getStorageSync('nickName'),//wx.getStorageSync('userName'),
      phoneNumber:wx.getStorageSync('phoneNumber'),//wx.getStorage('phoneNumber'),
      userPic:wx.getStorageSync('userPic'),
    })
    console.log("——————————————————————读到的用户的数据————————————————————");
    console.log(this.data.userName,"\n",this.data.phoneNumber,"\n",this.data.userPic,"\n");
  },
  
})