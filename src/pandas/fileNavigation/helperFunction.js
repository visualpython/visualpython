define([
    'nbextensions/visualpython/src/common/StringBuilder'
], function(sb) {

    /** makeKernelCurrentPath
     * @param {string} path 
     */
    var makeKernelCurrentPath = function(path, useFunction = false) {
        if (path === '') {
            path = '.';
        }
        if (!useFunction) {
            path = "'" + path + "'";
        }
        var sbCode = new sb.StringBuilder();
        sbCode.appendFormat("print(_vp_search_path({0}))", path);
        // sbCode.appendLine("import os as _os");
        // sbCode.appendLine("import datetime as _dt");
        // sbCode.appendFormatLine("_current = _os.path.abspath({0})", path);
        // sbCode.appendLine("_parent = _os.path.dirname(_current)");
        // sbCode.appendLine("");
        // sbCode.appendLine("# 파일크기 보기 좋게 변환");
        // sbCode.appendLine("def sizeof_fmt(num, suffix='B'):");
        // sbCode.appendLine("    for unit in ['','K','M','G','T','P','E','Z']:");
        // sbCode.appendLine("        if abs(num) < 1024.0:");
        // sbCode.appendLine("            return '%3.1f%s%s' % (num, unit, suffix)");
        // sbCode.appendLine("        num /= 1024.0");
        // sbCode.appendLine("    return '%.1f%s%s' % (num, 'Yi', suffix)");
        // sbCode.appendLine("");
        // sbCode.appendLine("with _os.scandir(_current) as i:");
        // sbCode.appendLine("    _info = []");
        // sbCode.appendLine("    _info.append({'current':_current,'parent':_parent})");
        // sbCode.appendLine("    for _entry in i:");
        // sbCode.appendLine("        _name = _entry.name");
        // sbCode.appendLine("        _path = _entry.path      # 파일 경로");
        // sbCode.appendLine("        _stat = _entry.stat()");
        // sbCode.appendLine("        _size = sizeof_fmt(_stat.st_size)    # 파일 크기");
        // sbCode.appendLine("        _a_time = _stat.st_atime # 최근 액세스 시간");
        // sbCode.appendLine("        _a_dt = _dt.datetime.fromtimestamp(_a_time).strftime('%Y-%m-%d %H:%M')");
        // sbCode.appendLine("        _m_time = _stat.st_mtime # 최근 수정 시간");
        // sbCode.appendLine("        _m_dt = _dt.datetime.fromtimestamp(_m_time).strftime('%Y-%m-%d %H:%M')");
        // sbCode.appendLine("        _e_type = 'other'");
        // sbCode.appendLine("        if _entry.is_file():");
        // sbCode.appendLine("            _e_type = 'file'");
        // sbCode.appendLine("        elif _entry.is_dir():");
        // sbCode.appendLine("            _e_type = 'dir'");
        // sbCode.appendLine("        _info.append({'name':_name, 'type':_e_type, 'path':_path, 'size':_size, 'atime':str(_a_dt), 'mtime':str(_m_dt)})");
        // sbCode.appendLine("    print(_info)");
        return sbCode.toString();
    }
    return {
        makeKernelCurrentPath
    }
});