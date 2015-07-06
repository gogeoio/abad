/**
 * Created by danfma on 16/03/15.
 */

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (prefix) {
        if (!prefix)
            return false;

        var cond = this.substring(0, prefix.length);

        return cond == prefix;
    };
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

// From here:
// http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
if (typeof String.prototype.replaceAll !== 'function') {
  function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  String.prototype.replaceAll = function(find, replace) {
    return this.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }
}