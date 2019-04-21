<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.2" tiledversion="1.2.3" name="terrain" tilewidth="16" tileheight="16" tilecount="256" columns="16">
 <image source="terrain.png" width="256" height="256"/>
 <tile id="2">
  <properties>
   <property name="collision" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="11" type="SpiderWeb"/>
 <tile id="16" type="TileReg"/>
 <tile id="27" type="ChestSmall">
  <properties>
   <property name="fileName" type="file" value=""/>
   <property name="fileSize" value="small"/>
  </properties>
 </tile>
 <tile id="36" type="TileMoss"/>
 <tile id="41" type="ChestLarge">
  <properties>
   <property name="fileName" type="file" value=""/>
   <property name="fileSize" value="Large"/>
  </properties>
 </tile>
 <tile id="42" type="ChestLarge">
  <properties>
   <property name="fileName" type="file" value=""/>
   <property name="fileSize" value="Large"/>
  </properties>
 </tile>
 <tile id="81" type="Door">
  <properties>
   <property name="ChangeDirectory" value="down"/>
   <property name="DirectoryName" value=""/>
  </properties>
 </tile>
 <tile id="83" type="Ladder">
  <properties>
   <property name="ChangeDirectory" value="up"/>
  </properties>
 </tile>
 <tile id="97" type="Door">
  <properties>
   <property name="ChangeDirectory" value="down"/>
   <property name="DirectoryName" value=""/>
  </properties>
 </tile>
 <tile id="127" type="Crack"/>
 <tile id="143" type="Crack"/>
</tileset>
