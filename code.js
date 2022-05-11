let count = ""
let dir = ""
let titel = "Cards,"
let newCount = ""
let textNode

function traverse(node,categoryBox, cardBox) {
  if ("children" in node) {

    if (node.type == 'FRAME' && node.name != "Template - DON'T FILL IN JUST COPY") {
      textNode = node.children[0]

      if (Math.round(node.fills[0].color.r*255) == parseInt(String(categoryBox).slice(1,3),16)
        && Math.round(node.fills[0].color.g*255) == parseInt(String(categoryBox).slice(3,5),16) 
        && Math.round(node.fills[0].color.b*255) == parseInt(String(categoryBox).slice(5,7),16)) {
        dir = ""
      }
      
      if (Math.round(node.fills[0].color.r*255) == parseInt(String(cardBox).slice(1,3),16)
      && Math.round(node.fills[0].color.g*255) == parseInt(String(cardBox).slice(3,5),16) 
      && Math.round(node.fills[0].color.b*255) == parseInt(String(cardBox).slice(5,7),16)) {
        count += textNode.name + "/" + dir.slice(0,-1) + "\n"
      }
      else {
        dir = textNode.name + "/" + dir
      }
      
    }

    if (node.type == 'PAGE' && node.name != "Template - DON'T FILL IN JUST COPY") {
      titel += node.name + ","
    }

    for (const child of node.children) {
      traverse(child, categoryBox, cardBox)
    }
  }
}

function sorter () {

  count = count.split('\n').sort().join('\n')
  
  let countArray = count.split("\n")
  let prev = countArray[0]

  let j = 0
  for (let i = 0; i < countArray.length; i++) { 
    if (countArray[i].split('/')[0]==prev.split('/')[0]) {
      newCount += countArray[i] + ","
      j++
    }
    else {
      newCount = newCount.slice(0,-1) + "\n" + countArray[i].split('/')[0]+ "," + countArray[i] + ","
      prev = countArray[i]
    }
  }
  newCount = titel.slice(0,-1) + "\n" + newCount
}

function outputerAsync () {
  return new Promise(resolve => {
    textNode = figma.createText()
    textNode.fontName = { family: "Work Sans", style: "Regular" }
    textNode.characters = newCount
    
    figma.ui.postMessage({ type: 'download', data: newCount })
    setTimeout(() => {
      resolve();
    }, 600);
  })
}

const loadFontsAsync = async () => {
  await figma.loadFontAsync({ family: "Work Sans", style: "Regular" })
  await figma.loadFontAsync({ family: "Work Sans", style: "Medium" })
  await figma.loadFontAsync({ family: "Work Sans", style: "Bold" })
}

if (figma.editorType === 'figma') {
    figma.showUI(__html__);
    figma.ui.onmessage = msg => {
        if (msg.type === 'create-shapes') {
            
            traverse(figma.root, msg.categoryBox, msg.cardBox)

            loadFontsAsync().then(() => {
              sorter()
              outputerAsync().then(() => {
                newCount = ""
                figma.closePlugin()
              })
            })

        }
    };
}