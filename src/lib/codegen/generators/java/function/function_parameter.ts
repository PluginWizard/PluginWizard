export default {
  block: 'function_parameter',
  // Parameters are read by def_function_params itself; on their own they produce no code.
  generator: function() {
    return '';
  },
};
