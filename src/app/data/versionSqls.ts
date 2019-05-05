export const VERSION_SQLS: { [version: number]: string[] } = {
  1: [
    ...[
      `CREATE TABLE IF NOT EXISTS t_app_error (
        id INTEGER PRIMARY KEY ASC,
        error text DEFAULT NULL,
        logTime INT DEFAULT NULL )`
    ]
  ],
  2: [
    ...[
      // t_trafficline
      // 热门 1 非热门 0
      `CREATE TABLE IF NOT EXISTS t_trafficline(
            Id INTEGER PRIMARY KEY
            ,Tag TEXT
            ,Code TEXT
            ,Name TEXT
            ,Nickname TEXT
            ,Pinyin TEXT
            ,Initial TEXT
            ,AirportCityCode TEXT
            ,CityCode TEXT
            ,CityName TEXT
            ,Description TEXT
            ,IsHot INT
            ,CountryCode TEXT
            ,Sequence INT
            ,EnglishName TEXT
            )`
    ]
  ],
  3: [...[`alter table t_trafficline add LastUpdateTime text`]]
};
