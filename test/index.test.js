const myProject = require('..')

// TODO: Implement module test
test('my-project', () => {
  expect(myProject('w')).toBe('w@zce.me')
  expect(myProject('w', { host: 'wedn.net' })).toBe('w@wedn.net')
  expect(() => myProject(100)).toThrow('Expected a string, got number')
})
