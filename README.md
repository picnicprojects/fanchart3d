# fanchart3d
Create 3D fanchart with timeline from a GEDCOM genealogy file.
Fanchart3D combines a timeline with a fanchart into a 3D object in the browser
[![](img/fanchart.jpg)](img/fanchart.jpg) 
[![](img/PriestleyChart.gif)](img/PriestleyChart.gif) 
=======
# FanChart with Timeline (3D) from GEDCOM genealogy file
## Usage
```
python fanchart3d.py
```
Then open index.html in a browser
## Features
Create a 3D FanChart from a GEDCOM file. Python script fanchart3d.py creates a json data file.
A javascript creates a 3D representation in the browser using Three.js.
## Example
A 3D fanchart of the Dutch Royal Family
[![Dutch Royal Family](img/dutchroyalfamily.gif)](img/dutchroyalfamily.gif) 
## Special Thanks
- gedcom2html uses [gedcom.py](https://github.com/nickreynke/python-gedcom) by Nick Reynke to parse the gedcom file
- [famousfamilytrees](http://famousfamilytrees.blogspot.com/?m=1) for the demo gedcom files
## To do
- put text on top of the fanchart
- put text on top of the timeline
- add timeline with year numbers