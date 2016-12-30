/*function a() { this.x=42; this.b=function() { console.log('b='+this.x); }; this.b(); }

var c=new a();

// a.prototype._inner=function() { this.b=function() { console.log('b='+(this.x+1)); }; console.log("b=",this.b); }
// a.prototype._inner();
a._inner=function() {
    this.b=function() { console.log('b='+(this.x+1)); };
    
    console.log("b=",this.b+'; this='+this); 
}
a._inner();

console.log("a=",a);
var d=new a();
*/

function alert(msg) { console.log(msg); }

var Person = function() { 
    //defaults
    var _age  =  0,
        _name = 'John Doe';
     
    var socialSecurity = '444 555 666';
    var bloodType      = 'O negative'
    //this is a global variable
    hatSize            = 'medium';
    var noValue;
     
    var aTest = function() {
      var nestedVar = 'nestedVar';
      var nestedFunction = function() {
        return 'nestedFunction';
      };
       
      alert('aTest');
    },
      anotherTest = function() {
        alert('anotherTest');
    };
     
    function test1() {
      alert('test1');
      var obj = { 
        test3: 'test3',
      bla:   234
      };
       
      function nestedFc() {
        alert('I am nested!');
      }
    }
     
    function test2() {
      alert('test2');
    }
     
    function test3() {
      alert('test3');
      
      return { 
        test3: 'test3',
        bla:   234
      };
    }
     
    this.initialize = function(name, age) {
      _name = _name || name;
      _age  = _age  || age;
    };
     
    if (arguments.length) this.initialize();
     
    //public properties. no accessors required
    this.phoneNumber = '555-224-5555';
    this.address     = '22 Acacia ave. London, England';
     
    //getters and setters
    this.getName     = function()      { return _name; };
    this.setName     = function (name) { _name = name; };
     
    //private functions
    function aFunction( arg1 ) {
      alert('I am a private function (ha!)');
    }
     
    //public methods
    this.addBirthday = function()      { _age++; };
    this.toString    = function()      { return 'My name is "+_name+" and I am "+_age+" years old.'; };
}; 


////////////////////

var Reflection = {}; 
 
Reflection.createExposedInstance = function(objectConstructor)
{
  // get the functions as a string
  var objectAsString    = objectConstructor.toString();
  console.log("objectAsString="+objectAsString);
  var aPrivateFunctions = objectAsString.match(/function\s*?(\w.*?)\(/g);
   
  // To expose the private functions, we create
  // a new function that goes trough the functions string
  // we could have done all string parsing in this class and
  // only associate the functions directly with string
  // manipulation here and not inside the new class,
  // but then we would have to expose the functions as string
  // in the code, which could lead to problems in the eval since
  // string might have semicolons, line breaks etc.
  var funcString = "new ("
                 + objectAsString.substring(0, objectAsString.length - 1)
                 + ";"
                 + "this._privates = {};\n"
                 + "this._initPrivates = function(pf) {"
                 + "  this._privates = {};"
                 + "  for (var i = 0, ii = pf.length; i < ii; i++)"
                 + "  {"
                 + "    var fn = pf[i].replace(/(function\\s+)/, '').replace('(', '');"
                 + "    try { "
                 + "      this._privates[fn] = eval(fn);"
                 + "    } catch (e) {"
                 + "      if (e.name == 'ReferenceError') { continue; }"
                 + "      else { throw e; }"
                 + "    }"
                 + "  }"
                 + "}"
                 + "\n\n})()";
 
  var instance = eval(funcString);
  instance._initPrivates(aPrivateFunctions);
 
  // delete the initiation functions
  delete instance._initPrivates;
 
  return instance;
}

Reflection.createExposedInstance(Person)._privates['test3']();
