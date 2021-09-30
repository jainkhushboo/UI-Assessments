var addCount = 0;
var desc = [];
var xPoints = [];
var yPoints = [];

const validateFileType = ()=>{
    var file = document.getElementById("filetag")
    var fileName = file.value;
    var idxDot = fileName.lastIndexOf(".") + 1;
    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile!=="jpg" && extFile!=="jpeg" && extFile!=="png" && extFile!=="svg" && extFile!=="bmp" && extFile!=="gif "){
        alert("Only image file uploads are allowed! Please choose a file in correct format!");
    } 
}

window.addEventListener('resize', function(){
    let image = document.querySelector('img');
    const rect = image.getBoundingClientRect();
    var table = document.getElementById("myTable");
    
    table.innerHTML = '';
    if(xPoints.length!==0){
        for(let i=0;i<xPoints.length;i++){
        createTableRow(i+1,(xPoints[i]*rect.width)/100,(yPoints[i]*rect.height)/100,desc[i],table);
    }
    }
});
    window.addEventListener('load', function() {
        document.querySelector('input[type="file"]').addEventListener('change', function() {
            var reader;
            if (this.files && this.files[0]) {
                let img = document.querySelector('img');
                var image = new Image();
                reader = new FileReader();
                reader.onload = ()=>{
                    image.onload = () => {
                        // console.log(" from1Image Name: "+this.files[0].name+ " dimensions: "+image.width+"* "+image.height+ " MIME type: "+this.files[0].type);
                        document.getElementById("unordered-list").innerHTML='';
                        document.getElementById("myTable").innerHTML='';
                        xPoints = []
                        yPoints = []
                        desc = []
                        addCount = 0;
                        URL.revokeObjectURL(img.src);  // no longer needed, free memory
                        document.getElementById("image-size").innerHTML = "Dimensions: "+image.width+" x "+image.height+ ", MIME type: "+this.files[0].type;
                    }
                    image.src = reader.result;
                    img.src = URL.createObjectURL(this.files[0]); // set src to blob url
                }
                reader.readAsDataURL(this.files[0]);  
            }
        });
    });

const submit = (curr)=>{
    
    var parent = curr.parentNode
    var superParent = parent.parentNode;
    superParent.children["invisibleText"].innerHTML = parent.children["tag"].value;
    
    if(parent.children["tag"].value !==''){
        let image = document.querySelector('img');
        image.setAttribute('onclick','GetCoordinates(event, this)');
        addCount = addCount+1;
        parent.style.display = 'none';

        tooltipTextContainer = document.getElementById('invisibleText');
        tooltipTextContainer.style.display = 'none';

        reddot = document.getElementById('reddot');
        
        reddot.addEventListener('mouseover',function(){
            tooltipTextContainer.style.display="block";
        })
         reddot.addEventListener('mouseleave',function(){
            tooltipTextContainer.style.display="none";
        })
         tooltipTextContainer.addEventListener('mouseover',function(){
            tooltipTextContainer.style.display="block";
            
        })
         tooltipTextContainer.addEventListener('mouseleave',function(){
            tooltipTextContainer.style.display="none";
        })
    
        document.getElementById("scrollableContainer").style.display = "block";
        desc.push(parent.children["tag"].value);

        var table = document.getElementById("myTable");
        this.createTableRow(addCount, PosX, PosY, parent.children["tag"].value, table);
    }
    else{
        alert("Please enter a description to submit!");
    }

}

function createTableRow(addCount, x, y, desc, table){
    if(addCount == 1 ){
            var firstRow = table.insertRow(0);
            var row1 = table.insertRow(1);
            var th1 = firstRow.insertCell(0);
            var th2 = firstRow.insertCell(1);
            var th3 = firstRow.insertCell(2);
            var cell1 = row1.insertCell(0);
            var cell2 = row1.insertCell(1);
            var cell3 = row1.insertCell(2);
            th1.innerHTML = "X Pos";
            th2.innerHTML = "Y Pos";
            th3.innerHTML = "Description";
            cell1.innerHTML = Math.round(x);
            cell2.innerHTML = Math.round(y);
            cell3.innerHTML = desc;
        }
        else{
            var row = table.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            cell1.innerHTML = Math.round(x);
            cell2.innerHTML = Math.round(y);
            cell3.innerHTML = desc;
        }  
}

const cancel = (curr) =>
{
    let image = document.querySelector('img');
    image.setAttribute('onclick','GetCoordinates(event, this)');
    var parent = curr.parentNode
    var superParent = parent.parentNode;
    var superSuperParent = superParent.parentNode;
    superSuperParent.removeChild(superParent);
    xPoints.pop();
    yPoints.pop();
}
var PosX = 0;
var PosY = 0;
var text;
var c;
var tooltipTextContainer;
var reddot;

const FindPosition = (oElement) =>
{
    let image = document.querySelector('img');
    image.setAttribute('onclick','')
    addPoint = false;

  if(typeof( oElement.offsetParent ) != "undefined"){
    for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent){
      posX += oElement.offsetLeft;
      posY += oElement.offsetTop;
    }
      return [ posX, posY ];
    }
    else{
      return [ oElement.x, oElement.y ];
    }
}


const GetCoordinates = (e, img)=>{
    let image = document.querySelector('img');
    image.setAttribute('onclick','');
    addPoint = false;
    document.getElementById('tag').value = '';

    //document.getElementById("scrollableContainer").style.display = "none";

    let x= e.offsetX || e.layerX;
    let y= e.offsetY || e.layerY;
    
    var ImgPos;
    ImgPos = FindPosition(img);
    if (!e) var e = window.event;
    const rect = img.getBoundingClientRect()
    var x1 = e.pageX - rect.left;
    var y1 = e.pageY - rect.top;

    var width = img.getBoundingClientRect().width;
    var height = img.getBoundingClientRect().height;
    //var li = document.createElement('div')
    c = document.getElementsByClassName("clonable-div divIntro")[0];
    text = c.getElementsByClassName("hoverInvisibleText")[0];
    var cloneddiv = c.cloneNode(true);    
    PosX = x1;
    PosY = y1;
    var xPercent = x1/width*100;
    var yPercent = y1/height*100;
    xPoints.push(xPercent);
    yPoints.push(yPercent);
    cloneddiv.style.left = xPercent+'%';
    cloneddiv.style.top = yPercent+'%';
    cloneddiv.style.display = 'block';
    cloneddiv.id = PosX +'' +PosY;
    cloneddiv.className = 'divIntro';

    var outerDiv = document.getElementById("outer-div")
    outerDiv.getElementsByTagName('div')[0].appendChild(cloneddiv);

    tooltipTextContainer = document.getElementById('invisibleText');
    tooltipTextContainer.style.display = 'none';

    tooltipTextContainer.addEventListener('mouseover',function(){
        tooltipTextContainer.style.display="none";
        text.style.display="none !important";
     })
     tooltipTextContainer.addEventListener('mouseleave',function(){
        tooltipTextContainer.style.display="none";
     })

     reddot = document.getElementById('reddot');
     reddot.addEventListener('mouseover',function(){
        tooltipTextContainer.style.display="none !important";
        text.style.display="none !important";
     })
     reddot.addEventListener('mouseleave',function(){
        tooltipTextContainer.style.display="none !important";
     })
}