const { DynamicConfig } = require('../DynamicConfig');

describe('Verify behavior of DynamicConfig', () => {
  const testConfig = new DynamicConfig(
    'test_config',
    {
      bool: true,
      number: 2,
      string: 'string',
      object: {
        key: 'value',
        key2: 123,
      },
      boolStr1: 'true',
      boolStr2: 'FALSE',
      numberStr1: '3',
      numberStr2: '3.3',
      numberStr3: '3.3.3',
    },
    'default'
  );

  beforeEach(() => {
    expect.hasAssertions();
  });

  test('Test constructor', () => {
    let config = new DynamicConfig();
    expect(config.getRawValue()).toStrictEqual({});

    config = new DynamicConfig('name', 123);
    expect(config.getRawValue()).toStrictEqual(123);
  });

  test('Test strings', () => {
    expect(testConfig.getString('boolStr1', '123')).toStrictEqual('true');
    expect(testConfig.getString('number', '123')).toStrictEqual('2');
    // @ts-ignore intentionally testing incorrect param type
    expect(testConfig.getString('key_not_found', false)).toStrictEqual('');
    expect(testConfig.getString('key_not_found', 'lorem ipsum')).toStrictEqual(
      'lorem ipsum'
    );
    expect(testConfig.getString('object', '1234')).toStrictEqual('1234');
  });

  test('Test numbers', () => {
    expect(testConfig.getNumber('bool')).toStrictEqual(1);
    expect(testConfig.getNumber('number')).toStrictEqual(2);
    expect(testConfig.getNumber('numberStr1')).toStrictEqual(3);
    expect(testConfig.getNumber('numberStr2')).toStrictEqual(3.3);
    expect(testConfig.getNumber('numberStr3')).toStrictEqual(0);
    // @ts-ignore intentionally testing incorrect param type
    expect(testConfig.getNumber('key_not_found', false)).toStrictEqual(0);
    expect(testConfig.getNumber('key_not_found', 456.2)).toStrictEqual(456.2);
  });

  test('Test booleans', () => {
    expect(testConfig.getBool('number')).toStrictEqual(false);
    expect(testConfig.getBool('bool')).toStrictEqual(true);
    expect(testConfig.getBool('boolStr1')).toStrictEqual(true);
    expect(testConfig.getBool('boolStr2')).toStrictEqual(false);
    expect(testConfig.getBool('key_not_found', false)).toStrictEqual(false);
    // @ts-ignore intentionally testing incorrect param type
    expect(testConfig.getBool('key_not_found', '123')).toStrictEqual(false);
  });

  test('Test objects', () => {
    expect(testConfig.getObject('number', null).getRawValue()).toStrictEqual(
      {}
    );
    expect(testConfig.getObject('number').getRawValue()).toStrictEqual({});
    expect(testConfig.getObject('object').getRawValue()).toStrictEqual({
      key: 'value',
      key2: 123,
    });
    expect(testConfig.getObject('key_not_found').getRawValue()).toStrictEqual(
      {}
    );
    expect(
      testConfig.getObject('key_not_found', false).getRawValue()
    ).toStrictEqual({});
    expect(
      testConfig.getObject('key_not_found', { test: true }).getRawValue()
    ).toStrictEqual({ test: true });
  });

  test('Test non object configs', () => {
    const numberConfig = new DynamicConfig('test', 4, 'default');
    expect(numberConfig.getRawValue()).toStrictEqual(4);

    const stringConfig = new DynamicConfig('test', 'test_123', 'default');
    expect(stringConfig.getRawValue()).toStrictEqual('test_123');

    const boolConfig = new DynamicConfig('test', true, 'default');
    expect(boolConfig.getRawValue()).toStrictEqual(true);
  });

  test('Test nesting configs', () => {
    expect(
      testConfig.getObject('object').getString('key', 'abc')
    ).toStrictEqual('value');
    expect(testConfig.getObject('object').getNumber('key2', 432)).toStrictEqual(
      123
    );
    expect(testConfig.getObject('object').getBool('key3', true)).toStrictEqual(
      true
    );

    expect(testConfig.getObject('boolStr2').getRawValue()).toStrictEqual({});
    expect(
      testConfig.getObject('boolStr2').getString('i dont exist', 'test')
    ).toStrictEqual('test');
    const config = new DynamicConfig(
      'test',
      {
        options: {
          default: {
            deep: {
              param: 9,
            },
          },
        },
      },
      'default'
    );
    expect(
      config
        .getObject('options')
        .getObject('default')
        .getObject('deep')
        .getNumber('param', 32)
    ).toStrictEqual(9);
  });
});