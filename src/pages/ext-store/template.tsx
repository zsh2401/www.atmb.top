import StdPage from '../../StdPage';
import RenderingReader from './RenderingReader'
export default function(data:any){
    data.ext_data = RenderingReader(data.htmlWebpackPlugin.options.exts_path);
    return StdPage(data);
}
