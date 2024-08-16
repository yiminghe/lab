import { check } from '../src/index';
import path from 'path';

check({
  srcDir: path.join(__dirname, 'fixture'),
});
