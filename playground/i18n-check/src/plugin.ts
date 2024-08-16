import rule from './rule';

const plugin = () => ({
  rules: { check: rule() },
});
export default plugin;
