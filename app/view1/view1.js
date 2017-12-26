'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', 'ngDialog','Ahdin', '$timeout', function($scope, ngDialog, Ahdin, $timeout) {

  $scope.cropping = {
    myImage: '',
    myCroppedImagenew:''
  };
  // $scope.myImage='';
  // $scope.myCroppedImagenew='';
  $scope.ImageOrientation = 1;
  $scope.imageRotated = false;
  $scope.aspectRatio = 2


  $scope.$watch('imageRotated', function(){
    console.log('value change', $scope.imageRotated)
  })


  $scope.isRotating = false;
  $scope.rotate = function(isClockwise) {
    console.log('called')
    // $scope.imageRotated = true;
    // console.log($scope.myImage)
    if (!$scope.cropping.myImage) return;
    $scope.isRotating = true;
    console.log($scope.ImageOrientation, $scope.imageRotated);
    rotateBase64Image($scope.cropping.myImage, isClockwise, function(result) {
      $scope.$apply(function() {  // $apply is required because we were called back outside of angular system
        $scope.cropping.myImage = result;
        $scope.isRotating = false;
      });
    });
  };

  function rotateBase64Image(base64data, isClockwise, callback) {
    console.log(isClockwise)
    var image = new Image();
    image.onload = function() {
      var canvas = document.createElement('canvas');
      var deg = '';
      console.log($scope.imageRotated)
      if(($scope.ImageOrientation == 6) && ($scope.imageRotated == false)){
        deg = isClockwise ? Math.PI : 0;
        canvas.width = image.width;
        canvas.height = image.height;
      }else if(($scope.ImageOrientation == 8) && ($scope.imageRotated == false)){
        deg = isClockwise ? 0 : -Math.PI;
        canvas.width = image.width;
        canvas.height = image.height;
      }else {
        var deg = isClockwise ? Math.PI / 2 : Math.PI / -2;
        canvas.width = image.height;
        canvas.height = image.width;
      }
      console.log("1========?>>>", deg, $scope.ImageOrientation)
      var ctx = canvas.getContext("2d");
      
      // translate to center-canvas
      // the origin [0,0] is now center-canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      // roate the canvas by +90% (==Math.PI/2)
      ctx.rotate(deg);
      // draw the signature
      // since images draw from top-left offset the draw by 1/2 width & height
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      // un-rotate the canvas by -90% (== -Math.PI/2)
      // ctx.rotate(-deg);
      // // un-translate the canvas back to origin==top-left canvas
      // ctx.translate(-canvas.width / 2, -canvas.height / 2);
      callback(canvas.toDataURL());
    $scope.imageRotated = true
      
    };
    //image.crossOrigin = "Anonymous";
    image.src = base64data;
  }




  function getOrientation(file, callback) {
    console.log(file)
    var reader = new FileReader();
    reader.onload = function(e) {
      var view = new DataView(e.target.result);
      if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
      var length = view.byteLength, offset = 2;
      while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xFFE1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
          var little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;
          for (var i = 0; i < tags; i++)
            if (view.getUint16(offset + (i * 12), little) == 0x0112)
              return callback(view.getUint16(offset + (i * 12) + 8, little));
        }
        else if ((marker & 0xFF00) != 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      return callback(-1);
    };
    reader.readAsArrayBuffer(file);
  }


  var handleFileSelect=function(evt) {
    var file=evt.currentTarget.files[0];
    var initialFile = file
    console.log(file.size);
    if(file.size > 5242880){
      // $('.fileInput').value('')
      alert('Image size');
      return
    }
    // Ahdin.compress({
    //   sourceFile: file,
    //   quality: 0.5
    // }).then(function(compressedBlob) {
    //   console.log(compressedBlob.size);
    //   var reader = new FileReader();
    //   reader.onload = function (compressedBlob) {
    //     $scope.$apply(function($scope){
    //       // console.log(compressedBlob.target.result)
    //       $scope.cropping.myImage=compressedBlob.target.result;
    //       getOrientation(file, function(orientation) {
    //         $scope.ImageOrientation = orientation;
    //         console.log('orientation: ' + orientation, orientation == 6);
    //         if(orientation == 6){
    //           // $timeout(function () {
    //             $scope.rotate(true);
    //           // } ,3000)
    //         }else if(orientation == 8){
    //           // $timeout(function () {
    //             $scope.rotate(false);
    //           // } ,3000)
    //         }
    //       });
    //     });
    //   };
    //
    //   reader.readAsDataURL(file);
    //   $scope.clickToOpen()
    // });
    // new ImageCompressor(file, {
    //   width: 1000,
    //   height: 1000,
    //   quality: 0.6,
    //   success: function (compressedBlob) {
          var reader = new FileReader();
          reader.onload = function (file) {
            $scope.$apply(function($scope){
              // console.log(compressedBlob.target.result)
              $scope.cropping.myImage=file.target.result;
              console.log('----->>>>',initialFile)
              getOrientation(initialFile, function(orientation) {
                $scope.ImageOrientation = orientation;
                console.log('orientation: ' + orientation, orientation == 6);
                // if(orientation == 6){
                //   // $timeout(function () {
                //     $scope.rotate(true);
                //   // } ,3000)
                // }else if(orientation == 8){
                //   // $timeout(function () {
                //     $scope.rotate(false);
                //   // } ,3000)
                // }
              });
            });
          };
          reader.readAsDataURL(file);
          $scope.clickToOpen()
    //   },
    //   error: null
    // })
  };
  angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

  $scope.clickToOpen = function () {

    ngDialog.open({
      template: 'templateId',
      scope: $scope,
      data:$scope.cropping.myImage,
      resizable: false,
      closeByEscape:false,
      closeByDocument:false,
      className: 'ngdialog-theme-default',
      preCloseCallback: function(value) {
        console.log('===== i work', value)
         $scope.imageRotated = false
      },
      controller: ['$scope',  function($scope) {
      }]});
  };


  $scope.saveImage = function () {
    console.log($scope.cropping.myCroppedImagenew)
    $scope.profileImage = $scope.cropping.myCroppedImagenew
    ngDialog.closeAll()
    $scope.imageRotated == false
  }


}]);