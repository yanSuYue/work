<template>
  <div class="hello">
          <div style="margin-top: 30px;color: #70DB55">
            <span style="font-weight: 600" @click="checkContract">点我试试</span>
        </div>
        <el-dialog :visible.sync="contractVisable" title="pdf展示" @close="closeDialog">
			         <div id="mycanvas" ref="mycanvas"></div>
			
	     	</el-dialog>
  </div>
</template>

<script>
	 import pdf from '../../static/build/pdf.js'
export default {
  data () {
    return {
    	contractVisable:false,
    }
  },
  methods:{
  	checkContract(){
  		this.contractVisable=true
  		this.$nextTick(()=>{
                let url = ' http://120.77.153.63:8080/roms/roms_sz/wp_fh_口腔CTRD01170034/366/1/366.pdf'
                let pdfjsLib = pdf
                pdfjsLib.PDFJS.workerSrc = '../../static/build/pdf.worker.js'
                let loadingTask = pdfjsLib.getDocument(url)
                loadingTask.promise.then((pdf) =>{
                    let numPages = pdf.numPages
                    let container = document.getElementById('mycanvas')
                    let pageNumber = 1
                 this.getPage(pdf,pageNumber,container,numPages)
                }, function (reason) {
                    alert(reason)
                });
                    })
  		
  	},
  	 getPage (pdf,pageNumber,container,numPages) { //获取pdf
  	      	console.log(numPages)
                let _this = this
                pdf.getPage(pageNumber).then((page) => {
                    let scale = (container.offsetWidth/page.view[2])
                    let viewport = page.getViewport(scale)
                    let canvas = document.createElement("canvas")
                    
                    canvas.width= viewport.width
                    canvas.height= viewport.height
                    container.appendChild(canvas)

                    console.log(container)
                    let ctx = canvas.getContext('2d');
                    var renderContext = {
                        canvasContext: ctx,
                        transform: [1, 0, 0, 1, 0, 0],
                        viewport: viewport,
                        intent: 'print'
                    };
                    page.render(renderContext).then(() => {
                        pageNumber +=1
                        console.log('pageNumber='+pageNumber)
                        console.log('numPages='+numPages)
                        if(pageNumber<=numPages) {
                            _this.getPage(pdf,pageNumber,container,numPages)
                        }
                    })
                })
            },
  	closeDialog(){
  		this.contractVisable=false
  	}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
