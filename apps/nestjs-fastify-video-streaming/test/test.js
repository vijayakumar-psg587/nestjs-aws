async function method1() {
  console.log('console log: name: Method1');
  // console.log(method2());
  setTimeout(() => {
    return Promise.resolve('Returning from method: Method1');
  }, 100);
}
function method2() {
  console.log('console log: name: Method2');
  return 'Returning from method: Method2';
}

(async function mainMethod() {
  console.log(await method1());
  console.log(method2());
})();
