const fs =require('fs')
const path=require('path')
module.exports = function addHuaweiPushBuildGradle(ctx) {
  const repositoriesBuildGradle = path.join(ctx.opts.projectRoot, 'platforms', 'android', 'repositories.gradle')
  const projectBuildGradle = path.join(ctx.opts.projectRoot, 'platforms', 'android', 'build.gradle')
  const repositoriesCnt = `/* Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements.  See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership.  The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, either express or implied.  See the License for the
  specific language governing permissions and limitations
  under the License.
*/

ext.repos = {
   google()
   jcenter()
   // 配置HMS Core SDK的Maven仓地址。
   maven {url 'https://developer.huawei.com/repo/'}
}
`
const projectBuildCnt = `/* Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
 ext.kotlin_version = '1.3.50'
 apply from: 'repositories.gradle'
 repositories repos

 dependencies {
     classpath 'com.android.tools.build:gradle:4.0.0'
     classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
     // NOTE: Do not place your application dependencies here; they belong
     // in the individual module build.gradle files
     classpath 'com.huawei.agconnect:agcp:1.5.2.300'
 }
}

allprojects {
 apply from: 'repositories.gradle'
 repositories repos

 //This replaces project.properties w.r.t. build settings
 project.ext {
   defaultBuildToolsVersion="29.0.2" //String
   defaultMinSdkVersion=22 //Integer - Minimum requirement is Android 5.1
   defaultTargetSdkVersion=29 //Integer - We ALWAYS target the latest by default
   defaultCompileSdkVersion=29 //Integer - We ALWAYS compile with the latest by default
 }
}

task clean(type: Delete) {
 delete rootProject.buildDir
}
`
  fs.writeFileSync(projectBuildGradle,projectBuildCnt, { encoding: 'utf8' })
  fs.writeFileSync(repositoriesBuildGradle,repositoriesCnt, { encoding: 'utf8' })

}
