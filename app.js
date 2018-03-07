
var app = angular.module('myapp',['ngRoute']);
app.run(function($rootScope) {
    $rootScope.user = null;
})
app.config(function($routeProvider){   //service provider   
    $routeProvider
    .when('/',{
         templateUrl:'/login.html',
        controller:'logCntr'
    })
    .when('/myhome',{
        templateUrl:'/myhome.html',
        controller:'myhomeCntr',
    })
     .when('/profile/:username',{
      templateUrl:'/profileDetails.html',
      controller:'userProfileController',
      resolve:['authService',function(authService) {  // use factory to check http
        return authService.isLoggedIn();
  }] ,
      
     })
    .when('/message/:username',{
        templateUrl:'message.html',
        resolve:['authService',function(authService) {  // use factory to check http
            return authService.isLoggedIn();
      }] ,
      controller:'msgCntr'
    })
    .when('/message/:username/:index',{
        templateUrl:'messageDetail.html',
        resolve:['authService',function(authService) {  // use factory to check http
            return authService.isLoggedIn();
      }] ,
      controller:'msgDetailCntr'
    })
    .when('/error',{
        redirectTo:'/'
    })
   
    .when('/register',{
        templateUrl:'register.html',
        controller:'regCntr'
    })
    .when('/edit/:username',{
        templateUrl:'edit.html',
        controller:'editCntr',
        resolve:['authService',function(authService) {  // use factory to check http
            return authService.isLoggedIn();
      }] ,
    })
    .when('/logout',{
        template:'You will logout',
        controller:'logoutCntr'
    })
   . otherwise({
        redirectTo:'/'
    })
});

app.controller('regCntr',function($scope, $location){
    $scope.save = function(){   
    $scope.user.message = [];
    $scope.all_users = JSON.parse(localStorage.getItem('users'))==null? []:JSON.parse(localStorage.getItem('users'));
    $scope.all_users.push($scope.user);
    $scope.user = {};
    localStorage.setItem('users',angular.toJson($scope.all_users));

    $location.path('/');
    }
});

app.controller('logCntr',['$rootScope','$scope','$location','validService',function( $rootScope,$scope,$location,validService){
    var user  = $scope.user;
    $scope.validMessage = function(user){
        if(validService.isValid(user))
        {
          alert('Welcome ' + user.username+ ' !');
        // currentUser.setUser(user.username);
        localStorage.setItem('cur_user',angular.toJson(user));
          $location.path('/myhome');
        }
          else
          alert('Invalide username or password');
    }   
  
}]);

app.controller('myhomeCntr',['$scope','$location','currentUser',function($scope,$location,currentUser){
    if(JSON.parse(localStorage.getItem('cur_user'))==null)
    $location.path('/');
    else
    $scope.username = JSON.parse(localStorage.getItem('cur_user')).username;
   
}]);



app.service('currentUser',function(){
    var users = JSON.parse(localStorage.getItem('users'));
    var user = JSON.parse(localStorage.getItem('cur_user'));
       this.getUser = function(){

        for(u of users)
        {
              if(u.username == user.username)
                return u;  
        }
             };
    
    this.getUserId = function(cur_user){

        for(var i=0;i<users.length;i++)
        {
              if(users[i].username==cur_user)
              return i;
        }     
    }
   
});

app.service('validService',function(){
       this.isValid = function(input){
           var obj = JSON.parse(localStorage.getItem('users'));
           for(var i=0;i<obj.length;i++)
           {
            if(obj[i].username==input.username && obj[i].password==input.password)
            return true;
           }     
            return false;
       }
})

app.controller('userProfileController',['$scope','$location','currentUser',function($scope, $location,currentUser){
   
    $scope.user = currentUser.getUser(); 
    $scope.username = JSON.parse(localStorage.getItem('cur_user')).username;
         $scope.goback = function(){
           $location.path('/myhome');
   }
  }]);

  app.controller('editCntr',['$scope','$location','$timeout','currentUser',function($scope,$location,$timeout,currentUser){
    console.log('user is '+ currentUser.getUser());
     $scope.user = currentUser.getUser(); 
     var loggedUser =JSON.parse(localStorage.getItem('cur_user'));
     var uid = currentUser.getUserId($scope.user.username);
    

    $scope.save = function(){
     var all_users = JSON.parse(localStorage.getItem('users'));
     all_users[uid] = $scope.user;
     loggedUser.username = $scope.user.username;
     loggedUser.password = $scope.user.password;
     localStorage.setItem('cur_user',angular.toJson(loggedUser));
     localStorage.setItem('users',angular.toJson(all_users));
     
    $timeout(function(){
        location.reload();
    },200);
    $timeout(function(){
        $scope.successMsg = 'Updates made successfully'
    },1000);
    };
 
   }]);


app.controller('msgDetailCntr',['$scope','$routeParams','$location','$timeout','currentUser',function($scope,$routeParams,$location,$timeout,currentUser){
    $scope.visibility = false;
    var users = JSON.parse(localStorage.getItem('users'));
    var user = currentUser.getUser();
    var i = $routeParams.index;
    $scope.message = user.message[i]; 

    $scope.getStyle=function(){
        if(user.message[i] && user.message[i].importance==true)
          return {'color':'red'};
}

    $scope.delete = function(){
        user.message.splice(i,1);
        var new_Users = [];
        for(u of users){
            if(u.username === user.username )
             new_Users.push(user);
           else
             new_Users.push(u);
        }
        localStorage.removeItem('users');
        localStorage.setItem('users',angular.toJson(new_Users));
        $location.path('/message/'+user.username);
    }

    $scope.replyarea = function(){
         $scope.visibility = true;
    };

    $scope.reply = function(){
        var cmp =  $scope.cmp;
        var from_user = user.username;
        var to_user = user.message[i].from;
        var user_id = currentUser.getUserId(to_user);
        const obj = {
            from : user.username,
            subject : $scope.message.subject,
            content : $scope.msg,
            importance :false
        }
        users[user_id].message.push(obj);
        localStorage.removeItem('users');
        localStorage.setItem('users',angular.toJson(users));
        $timeout(function(){
            location.reload()
             }, 500)
             
             alert('success!'); 
    };

    $scope.markeImportantce = function(){
        user.message[i].importance = !user.message[i].importance;
       
        var new_users = [];
        for(u of users) {
            if(u.username === user.username) 
                new_users.push(user);
            else   
             new_users.push(u);        
        }
        console.log(new_users);
        localStorage.removeItem('users');
        localStorage.setItem('users', angular.toJson(new_users));
    }
    $scope.back = function(){
        var uid = user.username;
        $location.path('/message/'+uid);
    }
}]);


app.controller('msgCntr',['$scope','$timeout','currentUser',function($scope, $timeout,currentUser){
    $scope.messages = currentUser.getUser().message;
     var msgs = currentUser.getUser().message;
    var from_user = currentUser.getUser().username;
    var all_users = JSON.parse(localStorage.getItem('users'));
    $scope.username = JSON.parse(localStorage.getItem('cur_user')).username;
 
    $scope.sent = function(){
        var cmp =  $scope.cmp;
        var user_id = currentUser.getUserId(cmp.to_user);
        const obj = {
            from : from_user,
            subject :cmp.sub,
            content : cmp.ctn,
            importance :false
        }
         var new_users = [];
         for(u of all_users) {
             if(u.username === cmp.to_user) {
                 u.message.push(obj);
                 new_users.push(u);
             } else {
                new_users.push(u);
             }
         }
         localStorage.setItem('users', angular.toJson(new_users));
         $timeout(function(){
         location.reload()
          }, 500)
          alert('success!'); 
    };
 
     
        //alert($scope.messages);
 
}]);


app.directive('mark',function(){
    return{
        restrict:'AE',
      
        link:function(scope,element,attrs){
               element.bind('click',function(event){
                if(this.style.color=='red'){
                    this.style.color='black';
                }
              else{
                this.style.color='black';
             
              }
               scope.$apply(attrs.mk);
               scope.getStyle();
               });
        }
    }
})


app.controller('logoutCntr', function($scope,$timeout,$location) {
    localStorage.removeItem('cur_user');
    $timeout(function(){
        location.reload();
        $location.path('/');
    }, 1500)
   
  

})



app.factory('authService',['$http','$q','$location',function($http,$q,$location){
    return {
        isLoggedIn:function(){
            var promise = $q.defer();
            var user = JSON.parse(localStorage.getItem('cur_user'));
            if(user == null) {
                promise.reject();
                $location.path('/');
            } else {
                promise.resolve('true');
            }
            return promise.promise;
        }
    }
}]);