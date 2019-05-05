import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { tap, switchMap, map, count } from "rxjs/operators";
import { VERSION_SQLS } from "../../data/versionSqls";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: "root"
})
export class DbService {
  constructor() {}
  private openDb() {
    // 数据库名称
    // 版本号
    // 描述文本
    // 数据库大小
    // 创建回调
    return window["openDatabase"](
      "skytripDb",
      "1.0",
      "sky trip 的客户端数据库",
      2 * 1024 * 1024
    );
  }
  executeSql(sql: string, sqlParams?: any[]) {
    return new Observable<any>(obs => {
      this.openDb().transaction(tx => {
        tx.executeSql(
          sql,
          sqlParams,
          (ctx, res) => {
            obs.next(res);
            obs.complete();
          },
          (ctx, err) => {
            obs.error(err);
          }
        );
      });
    });
  }
  updateSqlVersion() {
    return this.executeSql(
      `select * from sqlite_master where type='table' and name='t_sql_version'`
    ).pipe(
      switchMap(res => {
        if (res.rows.length === 0) {
          // 如果不存在，先创建表，然后插入第一个数据库版本,并且返回第一个数据库版本
          const initialVer = 0;
          return this.executeSql(
            `create table t_sql_version(id integer primary key,SqlVersion int)`
          ).pipe(
            switchMap(() =>
              this.executeSql(
                `insert into t_sql_version(SqlVersion)values(${initialVer})`
              )
            ),
            map(() => initialVer)
          );
        }
        return this.executeSql(
          `select * from t_sql_version order by SqlVersion desc`
        ).pipe(
          map(ver => {
            return ver.rows.item(0)["SqlVersion"];
          })
        );
      }),
      switchMap(lastVer => {
        // console.log(lastVer);
        // 由大到小排序
        const updateSqls = Object.keys(VERSION_SQLS)
          .filter(k => k > lastVer)
          .reduce(
            (sqls, v) => {
              const s = VERSION_SQLS[+v].filter(sql => sql.length > 0);
              sqls = [...sqls, ...s];
              return sqls;
            },
            [] as string[]
          );
        return new Observable<boolean>(obs => {
          const that = this;
          let exeCount = 0;
          (function exeOne(sqls) {
            const sql = sqls.splice(0, 1)[0];
            if (!environment.production) {
              console.log(`执行第${++exeCount}个sql`);
            }
            if (sql) {
              that.openDb().transaction(tx => {
                tx.executeSql(
                  sql,
                  null,
                  (ctx, res) => {
                    exeOne(sqls);
                  },
                  (ctx, err) => {
                    obs.error(err);
                  }
                );
              });
            } else {
              obs.next(true);
              obs.complete();
            }
          })(updateSqls);
        }).pipe(
          switchMap(ok => {
            const newVer = Object.keys(VERSION_SQLS).sort(
              (v1, v2) => +v2 - +v1
            )[0];
            if (lastVer === newVer) {
              return of(newVer);
            }
            return this.executeSql(
              `insert into t_sql_version(SqlVersion)values(${newVer})`
            ).pipe(map(() => newVer));
          })
        );
      })
    );
  }
  logError(error) {
    console.log(`${error}`);
    return this.executeSql(
      `insert into t_app_error(error,logTime)values('${error}',${Date.now()})`
    );
  }
  executeSqlBatch(batchSqls: Array<string | Array<any>>) {
    const a: [string, any[]] = [
      "INSERT INTO DemoTable VALUES (?,?)",
      ["Alice", 101]
    ];
    // const test = [
    //   "CREATE TABLE IF NOT EXISTS DemoTable (name, score)",
    //   ["INSERT INTO DemoTable VALUES (?,?)", ["Alice", 101]],
    //   ["INSERT INTO DemoTable VALUES (?,?)", ["Betty", 202]]
    // ];
    const testSqls = [];
    testSqls.push("drop table DemoTable");
    testSqls.push(`CREATE TABLE IF NOT EXISTS DemoTable (name, score)`);
    for (let i = 0; i < 10e3; i++) {
      testSqls.push(["INSERT INTO DemoTable VALUES (?,?)", [`Alic${i}`, i]]);
    }
    batchSqls = batchSqls || testSqls;
    if(batchSqls.length===0){
      return of(true);
    }
    return new Observable<boolean>(obs => {
      const db = this.openDb();
      (function execOne(sqls) {
        const sql = sqls.splice(0, 1)[0];
        if (sql) {
          if (typeof sql ==='string') {
            db.transaction(tx => {
              tx.executeSql(
                sql,
                null,
                (ctx, res) => {
                  execOne(sqls);
                },
                (ctx, err) => {
                  obs.error(err);
                }
              );
            });
          } else {
            const s = sql[0] as string;
            const p = sql[1] as any[];
            db.transaction(tx => {
              tx.executeSql(
                s,
                p,
                (ctx, res) => {
                  execOne(sqls);
                },
                (ctx, err) => {
                  obs.error(err);
                }
              );
            });
          }
        } else {
          obs.next(true);
          obs.complete();
        }
      })(batchSqls);
    });
  }
}
