import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'app-image-cutor',
  templateUrl: './image-cutor.component.html',
  styleUrls: ['./image-cutor.component.scss'],
})
export class ImageCutorComponent implements OnInit,AfterViewInit {

  constructor() { }

  ngOnInit() {}
  onclick()
  {

  }
  ngAfterViewInit(){
     //上次图片
     $("img[ImageCutor='ShowImager']").click(function () {
      $("#divSaveCut").attr("ImageId", $(this).attr("Id"));
  });
  $("*[name='cuttypebtn']").click(function () {
      $("*[name='cuttypebtn']").attr("class", "btn");
      $(this).attr("class", "btn sel");
  });
  
  var cutor = new window['Winner'].ImageCutor("divCutContainer", { IsSynchSaveImage:false});
  cutor.Initialize();
  cutor.SaveImage = function(data,func) {
      $.ajax({
          type: "Post",
          url: "/Commodity/UpdateImage",
          data: { fileValue: data.split(',')[1], fileName: cutor.File[0].files[0].name },
          async: true,
          dataType: "json",
          success: function(data) {
              $("#divSaveCut").removeAttr("IsClick");
              if (data.Status) {
                  var id = "#" + $("#divSaveCut").attr("ImageId");
                  $(id).attr("src", data.Message + "?v=" + new Date());
                  $(id).attr("realsrc", data.Message);
                  $("#divCutContainer").hide();
                  $(".cutbottom").hide();
                  if ($("#divSaveCut").attr("ImageId") == "imgFileName")
                      $("#divClearImage").show();
              } else {
                  alert(data.Message);
              }
              func();
             
          },
          error: function() {
              $("#divSaveCut").removeAttr("IsClick");
              $(".cutbottom").hide();
              $("#divCutContainer").hide();
              alert("系统忙，请稍候再试");
              func();
          
          }
      });
    
  };

  $("#divCutContainer").find(".cutimg").css("height", $("#divCutContainer").height());
  ///设置保存按钮
  $('.addcontent').find("input[type='text']").bind('focus', function () {
      $("#btnSave").hide();

  }).bind('blur', function () {
      $("#btnSave").show();
  });
  }
}
