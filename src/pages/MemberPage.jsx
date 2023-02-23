import firebase from 'firebase/compat/app';
// import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import React , { useEffect, useState, useRef , useCallback , useMemo }from "react";
import Base from '../pages/Base.jsx'
import UploadBird from './page_control/UploadBird.jsx';
import { MemberPageCSS } from '../css/MemberPage.scss'
import { getAuth, onAuthStateChanged ,signOut , updateProfile} from "firebase/auth";
import { getFirestore, doc, setDoc , getDoc , getDocs } from "firebase/firestore"
import { useNavigate } from "react-router-dom";
import db from './../../firebase-servise.js';
import { auth } from './../../firebase-servise.js';
import { storage } from './../../firebase-servise.js';
import { getStorage, ref , uploadBytes, getDownloadURL } from "firebase/storage";
import { fabric } from 'fabric';
import { async } from '@firebase/util';


const MemberPage = () =>{
    const navigate = useNavigate();//取得 navigate
    const auth = getAuth();    
    const logout = () =>{
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log("Sign-out successful.")
            navigate(-1);
          }).catch((error) => {
            // An error happened.
            console.log(error)
          });
    }
    // 上傳鳥照
    const [showUpload, setShowUpload] = useState(false);
    const callUpload = () =>{
      setShowUpload(true);
    }
    // 會員基本資料
    const [userName , setUserName] = useState("")
    const [userId , setUserId ] = useState("")
    const [userPhoto , setUserPhoto] = useState("https://www.doujin.com.tw/uploads/books/74/b8/74b84631e39a6f502ee1ccc1c59c9089_raw.jpg")
    const [userEmail , setUserEmail] = useState("")
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                const uid = user.uid;
                const photoURL = user.photoURL;
                const email = user.email
                const userName = user.displayName ;            
                setUserName(userName)
                setUserId(uid)
                setUserEmail(email)
                setUserPhoto(photoURL)
                console.log("userName: " , userName , "email: " , email)
                // setLoginSuccess(true) 

            } else {
                // User is signed out
                // setLoginSuccess(false)
            }
        });
    }, []);
    // 拿取會員頭貼style設定
    useEffect(() => {
      const getStyle = async()=>{
        try{
          const docSnap = await getDoc(doc(db, "Profile","user"));
          if(docSnap) {
            const left = docSnap.data().user.profileStyle.left
            const top = docSnap.data().user.profileStyle.top
            const scaleX = docSnap.data().user.profileStyle.scaleX
            const scaleY = docSnap.data().user.profileStyle.scaleY
            const TransformOrigin = docSnap.data().user.profileStyle.transformOrigin
            setImgPosition({ left: left , top: top})
            setScaleX(scaleX)
            setScaleY(scaleY)
            setTransformOrigin(TransformOrigin)
            // console.log(TransformOrigin)
          }
          else{
            return
          }
        }
        catch(e){
          console.log(e.message)
        }
      }
      getStyle();
    }, []);

    // Create a storage reference from our storage service
    const storageRef = ref(storage);  
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewPhoto , setPreviewPhoto] = useState(true);
    const [image, setImage] = useState(null);
    const [imgPosition, setImgPosition] = useState({ left: 0, top: 0 });
    const [scale, setScale] = useState(1); 
    const [scaleX , setScaleX] = useState(1);
    const [scaleY , setScaleY] = useState(1);
    const canvasRef = useRef(null);
    const [canvasWidth, setCanvasWidth] = useState(200); // 設定 Canvas 寬度為 500px
    const [canvasHeight, setCanvasHeight] = useState(200); // 設定 Canvas 高度為 300px
    const [showUploadButton , setShowUploadButton] = useState(false)
    const [uploadStatus, setUploadStatus] = useState(null); // 新增狀態欄位
    // 先選照片
    const handleFileSelect = async(event) => {
        const selectedFile = event.target.files[0];
        setSelectedFile(selectedFile);
        if(selectedFile){
          setShowUploadButton(true);
        }else{
          setShowUploadButton(false);
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);       
        setPreviewPhoto(false)

        const reader = new FileReader();
        reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            setImage(img);
        };
        img.src = event.target.result;
        };
        reader.readAsDataURL(selectedFile);
       
        
    }
    // 預覽縮放   
    const handleScaling = useCallback((e) => {
      const obj = e.target;
      if (obj && obj.scaleX && obj.scaleY && obj.canvas) {
        const newScaleX = obj.scaleX * obj.canvas.getZoom();
        const newScaleY = obj.scaleY * obj.canvas.getZoom();
        obj.scaleX = newScaleX;
        obj.scaleY = newScaleY;
        // setScale((newScaleX + newScaleY) / 2);
        setScaleX(newScaleX)
        setScaleY(newScaleY)
        obj.setCoords();
      }
    }, []); 
    // 預覽拖曳
    const [ newImg , setNewImg] = useState(null)
    const [profileStyle , setProfileStyle] = useState({
      "left": 0,
      "top": 0,
      "scaleX" :1,
      "scaleY" : 1
    })
    const [ TransformOrigin , setTransformOrigin] = useState('0px, 0px')
    useEffect(() => {
        if (canvasRef.current) {
          const canvas = new fabric.Canvas(canvasRef.current);
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          if (image) {           
            const img = new fabric.Image(image, {
              left: 0,
              top: 0,
              scaleX:  canvas.width / image.width,
              scaleY:  canvas.height / image.height,
            });

    
            canvas.add(img);
            canvas.setActiveObject(img);
            img.on('scaling', handleScaling);
            setNewImg(img)
     
          }
    
          canvas.on('object:moving', (e) => {
            const obj = e.target;
            obj.setCoords();
            // setImgPosition({ left: obj.left, top: obj.top });
            const boundingRect = obj.getBoundingRect();
             console.log(obj)          
          });
    
          canvas.on('object:scaling', (e) => {
            const obj = e.target;
            obj.setCoords();           
            // 有所謂的obj.scaleX 、 obj.scaleY、obj.left、obj.top
            // 可以console.log(obj)來看
            const scaleX = obj.scaleX * (obj.width / canvasWidth);
            const scaleY = obj.scaleY * (obj.height / canvasHeight);
            setScaleX(scaleX);
            setScaleY(scaleY);
            const boundingRect = obj.getBoundingRect();
            const left = (boundingRect.left + obj.width / 2) * obj.scaleX - canvasWidth / 2;
            const top = (boundingRect.top + obj.height / 2) * obj.scaleY - canvasHeight / 2;
            // 計算出圖像的中心點坐標
            const centerX = boundingRect.left + obj.width / 2;
            const centerY = boundingRect.top + obj.height / 2;
            // 計算出圖像相對於 canvas-container 的偏移量
            const leftMove = centerX * obj.scaleX - canvasWidth / 2;
            const topMove = centerY * obj.scaleY - canvasHeight / 2;
            // 計算出圖像的縮放中心點坐標
            const tx = (obj.left -left) / obj.scaleX;
            const ty = (obj.top - top) / obj.scaleY;
            // 計算出圖像在 canvas-container 中的位置
            const containerLeft = 0 + left + obj.left;
            const containerTop = 0 + top + obj.top;
           
            // 計算 transformOrigin 的值 長高圖
            if (obj.height > obj.width){
              
              const adjustLeft =canvasWidth/2
              const adjustTop =canvasHeight/2
              // const tx =  ( (obj.width / canvasWidth) / 2) * scaleX + obj.left ; //boundingRect.left +
              // const ty =  ((obj.height / canvasHeight) / 2) * scaleY + obj.top; // boundingRect.top
           
              setTransformOrigin(tx , ty);
              setProfileStyle({
                "left": containerLeft,
                "top": containerTop,
                "scaleX" :scaleX,
                "scaleY" : scaleY,
                "transformOrigin":  tx + 'px ' + ty + 'px'  // tx + 'px ' + ty + 'px'
              })
            }
            else{           
              obj.setCoords();     
              // const tx = ((obj.width / canvasWidth)) * obj.scaleX + obj.left  + (canvasWidth / 2) ; //boundingRect.left +
              // const ty = ( (obj.height / canvasHeight)) * obj.scaleY + obj.top;         
              console.log("中心left",left,"top: ", top)
              const adjustLeft =canvasWidth/2
              const adjustTop =canvasHeight/2
              setTransformOrigin(tx , ty);
              setProfileStyle({
                "left": containerLeft,
                "top": containerTop,
                "scaleX" :scaleX,
                "scaleY" : scaleY,
                "transformOrigin": tx + 'px ' + ty + 'px'
              })
            }
            
            // console.log(TransformOrigin)
            // setScaleX(obj.scaleX)
            // setScaleY(obj.scaleY)
           

            // console.log(obj)
            // console.log( "左" ,boundingRect.left)
            // console.log("top" ,boundingRect.top)
          });


        }
      }, [image, handleScaling]);
    
    // 確定上傳

    const handleUpload = async() => {
        // console.log(userId)
        if (!selectedFile) {
          return;
        }
        setUploadStatus("上傳中");
        // 獲取當前圖像的位置和scale
        const canvas = canvasRef.current;
        // 移除事件监听器
        if (canvas) {
          // canvas.add(newImg)

          // canvas.off('object:moving');
          // canvas.off('object:scaling');
        
          // 在Firebase Storage上傳前，將位置和scale信息寫入圖像元數據
          // 用database吧
          try {
            // 把最終大頭照設定上傳到database

            await setDoc(doc(db, "Profile", "user"), {
              user:{
                "email": userEmail,
                profileStyle
              }               
              
            });
          } catch (err) {
            console.error("Error: ", err);
          }

          const uploadPath = `users/${userEmail}/profilePhoto.png`;        
          uploadBytes(ref(storage, uploadPath), selectedFile ).then(() => {
            setUploadStatus("上傳成功，自動刷新頁面");
            // console.log('照片上傳成功');
              // 照片上傳成功後，獲取照片下載 URL 並顯示照片
              getDownloadURL(ref(storage, uploadPath)).then((url) => {
                  // Update the user profile in Firebase Auth
                  updateProfile(auth.currentUser, {
                    photoURL: url
                  }).then(() => {
                    // Profile updated successfully
                    console.log("Profile updated successfully");
                    setUserPhoto(url)
                    navigate(0)

                  }).catch((error) => {
                    // An error occurred
                    console.error(error);
                  });            

              })
          }).catch((error) => {
            console.error('照片上傳失敗', error);
          });      
        } // if (canvas)
  }
    
    return (      
        <div>
            <Base></Base>
            {showUpload && <UploadBird />}
            <div className='main'>
            
            <div className='main-member'> {/* 鳥友會員頁 */} 
                <div className='bird-section'>
                  <button className='upload-bird' onClick={callUpload}>上傳鳥照</button>
                  
                </div>
                
                <div className='user-box'> 
                    <div className='user-photo-container'>
                        {!previewPhoto ? 
                        (
                            <>                                                        
                            <canvas className='canvas' ref={canvasRef} width={canvasWidth} height={canvasHeight}/>
                            {/* <img src={previewUrl} className='photo-preview' />   */}                                                    
                            </>
                        )
                            :
                        (
                            <>                            
                             <img src={userPhoto}  className='user-photo'    
                             style={{
                              width: '200px',
                              height:'200px',
                              left: imgPosition.left,
                              top: imgPosition.top,
                              position: 'relative', 
                              // transformOrigin: TransformOrigin,
                              // transformStyle: 'initial',    
                              transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
                              
                            }}
                                            
                             /> {/*className='user-photo'*/}
                            
                            </>
                        )
                    }
                        
                       
                    </div>
                    <label htmlFor="upload-photo" className='upload-photo'>
                        <span className='choose'>{uploadStatus || '更換照片'}</span>                      
                        <input
                        type="file"
                        id="upload-photo"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        />
                        {showUploadButton &&
                         <button onClick={handleUpload}>上傳 !</button>
                        }
                        
                    </label>
                    
                </div>
                <div className='user-name'>{userName}</div>  
                <div className='logout-box'>
                  <button onClick={logout} className='logout'> 點此登出 </button>
                </div>
                
                          
                
            </div>
        
        </div>
        </div>
    )

}
export default MemberPage