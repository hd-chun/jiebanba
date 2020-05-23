var x, y, x1, y1, x2, y2;
import _ from '../../utils/underscore';
const app = getApp();
const MAX_UPLOAD_IMAGE_COUNT = 9; //最大图片数量
// s_v: 10, //距离top
//   s_h: 10,  //距离left
//     u_w: 70,  //宽度
//       u_h: 40,  //间距
//         all_width: '', //总的宽度
Page({
  data: {
    current: -1,
    s_v: 0,
    s_h: 10,
    u_w: 20,
    u_h: 0,
    all_width: '', //总的宽度
    move_x: '',
    move_y: '',
    pics: []
  },
  onLoad: function () {
    var self = this;
    //console.log("onLoad", self.data.all_list)
    //console.log("onLoad", self.data.pics)
  },

  //图片预览
  previewImage: function (e) {
    const index = e.target.dataset.index
    console.log("this.data.pics", this.data.pics)
    const images = [],
      uploadFiles = this.data.pics;
    _.each(uploadFiles, item => images.push(item.file));
    wx.previewImage({
      current: images[index],
      urls: images,
    });
  },

  movestart: function (e) {
    console.log("movestart", e)
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
    x1 = e.currentTarget.offsetLeft;
    y1 = e.currentTarget.offsetTop;
    console.log("x1", x1, "y1", y1)
    this.setData({
      current: e.target.dataset.index,
      move_x: x1,
      move_y: y1
    });
  },
  move: function (e) {
    //console.log("move")
    var self = this;
    x2 = e.touches[0].clientX - x + x1;
    y2 = e.touches[0].clientY - y + y1;
    var underIndex = this.getCurrnetUnderIndex();
    if (underIndex != null && underIndex != this.data.current) {
      console.log("this.data.pics", this.data.pics)
      var arr = [].concat(this.data.pics);
      //console.log("arr+111", arr)
      this.changeArrayData(arr, underIndex, this.data.current);
      //console.log("arr+222", arr)
      this.setData({
        pics: arr,
        current: underIndex
      })
    }
    this.setData({
      move_x: x2,
      move_y: y2
    });
  },
  moveend: function (e) {
    //console.log("moveend")
    this.setData({
      current: -1,
    })
  },
  changeArrayData: function (arr, i1, i2) {
    //console.log("changeArrayData")
    var temp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = temp;

    var _left = arr[i1]._left,
      _top = arr[i1]._top;
    arr[i1]._left = arr[i2]._left;
    arr[i1]._top = arr[i2]._top;
    arr[i2]._left = _left;
    arr[i2]._top = _top;

    var left = arr[i1].left,
      top = arr[i1].top;
    arr[i1].left = arr[i2].left;
    arr[i1].top = arr[i2].top;
    arr[i2].left = left;
    arr[i2].top = top;

  },
  getCurrnetUnderIndex: function (endx, endy) { //获取当前移动下方index
    //console.log("getCurrnetUnderIndex")
    var endx = x2 + this.data.u_w / 2,
      endy = y2 + this.data.u_h / 2;
    var v_judge = false,
      h_judge = false,
      column_num = (this.data.all_width - this.data.s_h) / (this.data.s_h + this.data.u_w) >> 0;
    var _column = (endy - this.data.s_v) / (this.data.u_h + this.data.s_v) >> 0;
    var min_top = this.data.s_v + (_column) * (this.data.u_h + this.data.s_v),
      max_top = min_top + this.data.u_h;
    if (endy > min_top && endy < max_top) {
      v_judge = true;
    }
    var _row = (endx - this.data.s_h) / (this.data.u_w + this.data.s_h) >> 0;
    var min_left = this.data.s_h + (_row) * (this.data.u_w + this.data.s_h),
      max_left = min_left + this.data.u_w;
    if (endx > min_left && endx < max_left) {
      h_judge = true;
    }
    if (v_judge && h_judge) {
      var index = _column * column_num + _row;
      if (index > this.data.pics.length - 1) { //超过了
        return null;
      } else {
        return index;
      }
    } else {
      return null;
    }
  },

  /* 图片方法 */
  onChooseUploadImageTap: function () {
    let data = this;
    wx.showActionSheet({
      itemList: ['选择图片', '相机拍照'],
      itemColor: "#333333",
      success: function (res) {
        // ////////console.log(res)
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            data.chooseWxImage('album')
          } else if (res.tapIndex == 1) {
            data.chooseWxImage('camera')
          }
        }
      }
    })
  },

  /* 选择图片是从相册还是拍照选图片 */
  chooseWxImage: function (type) {

    var self = this
    var data = this,
      pics = data.data.pics;
    wx.chooseImage({
      count: MAX_UPLOAD_IMAGE_COUNT - data.data.pics.length,
      sizeType: ['original'],
      sourceType: [type],

      success: function (res) {
        _.each(res.tempFilePaths, file => pics.push({
          file
        }));
        wx.getSystemInfo({
          success: function (res) {
            var width = self.data.all_width = res.windowWidth,

              _w = 0,
              row = 0,
              column = 0;
            var arr = [].concat(self.data.pics)
            arr.forEach(function (n, i) {
              n.left = (self.data.u_w + self.data.s_h) * row + self.data.s_h;
              n.top = (self.data.u_h + self.data.s_v) * column + self.data.s_v;
              n._left = n.left;
              n._top = n.top;
              _w += self.data.u_w + self.data.s_h;
              if (_w + self.data.u_w + self.data.s_h > width) {
                _w = 0;
                row = 0;
                column++;
              } else {
                row++;
              }
            });
          }
        });

        console.log("onLoad", pics)
        data.setData({
          pics: pics
        })
      }
    })


  },

})