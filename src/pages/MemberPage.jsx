import firebase from 'firebase/compat/app';
import 'firebaseui/dist/firebaseui.css';
import React , { useEffect, useState, useRef , useCallback , useMemo }from "react";
import Base from '../pages/Base.jsx'
import UploadBird from './page_control/UploadBird.jsx';
import { MemberPageCSS } from '../css/MemberPage.scss'
import { getAuth, onAuthStateChanged ,signOut , updateProfile} from "firebase/auth";
import { getFirestore , doc, setDoc , getDoc , getDocs , collection , query, where } from "firebase/firestore"
import { useNavigate , NavLink, useParams } from "react-router-dom";
import db from './../../firebase-service.js';
import { auth } from './../../firebase-service.js';
import { storage } from './../../firebase-service.js';
import { getStorage, ref , uploadBytes, getDownloadURL } from "firebase/storage";
import { fabric } from 'fabric';
import { async } from '@firebase/util';
import html2canvas from 'html2canvas';

const MemberPage = () =>{
    const navigate = useNavigate();//取得 navigate
    const auth = getAuth();    
    const logout = () =>{
        signOut(auth).then(() => {
            console.log("Sign-out successful.")
            navigate(-1);
          }).catch((error) => {
            console.log(error)
          });
    }
    // 上傳鳥照
    const [showUpload, setShowUpload] = useState(false);
    const callUpload = () =>{
      setShowUpload(!showUpload);
    }

    // 會員基本資料
    const [userName , setUserName] = useState("")
    const [userId , setUserId ] = useState("")
    const [userPhoto , setUserPhoto] = useState("https://images.plurk.com/LHcdc5166UeWc8bXYDVm.png")
    const [userEmail , setUserEmail] = useState("")
    const [getUser , setGetUser] = useState(false)
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
                setGetUser(true)           
            } else {
                // User is signed out
                return
            }
        });       
    }, []);
    const [getPhoto , setGetPhoto] = useState([]);
    const [selectedDate , setSelectedDate] = useState("");
    const [birdName , setBirdName] = useState([]);
    const [birdCode , setBirdCode] = useState([]);
    const [birdTime , setBirdTime] = useState([]);
    const [birdLocal , setBirdLocal]= useState([]);
    const [locId , setLocId] = useState([]);
    const handleDateChange = (event) => {
      setSelectedDate(event.target.value);
    };
    // 展示鳥照
    useEffect(() => {
      const getBirdPhoto = async()=>{
        try{
          const ref = collection(db, "Upload_bird_photo");
          const q = query(ref, where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);
          const userShotImgList = []
          const birdNameList = []
          const birdCodeList = []
          const birdTimeList = []
          const birdLocalList = []
          const locIdList = []
          querySnapshot.forEach((doc) => {
            const userShotImg = doc.data().img           
            userShotImgList.push(userShotImg)
            birdNameList.push(doc.data().ch_name)
            birdCodeList.push(doc.data().spp_code)
            birdTimeList.push(doc.data().date)
            birdLocalList.push(doc.data().locationName)
            locIdList.push(doc.data().location)

          });
          setGetPhoto(userShotImgList)
          setBirdName(birdNameList)
          setBirdCode(birdCodeList)
          setBirdTime(birdTimeList)
          setBirdLocal(birdLocalList)
          setLocId(locIdList)
        }
        catch(e){
          console.log("拿鳥照", e)
        }
      }
      getBirdPhoto();
    }, [getUser]);
    // 拿取會員頭貼style設定
    useEffect(() => {
      const getStyle = async()=>{
        try{
          const docSnap = await getDoc(doc(db, "Profile",userEmail));
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
          }
          else{
            return
          }
        }
        catch(e){
          // console.log(e.message)
        }
      }
      getStyle();
    }, [getUser]);

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
            const boundingRect = obj.getBoundingRect();          
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
              // console.log("中心left",left,"top: ", top)
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
        
        if (canvas) {

          try {
            // 把最終大頭照設定上傳到database          
            await setDoc(doc(db, "Profile", userEmail), {
              user:{
                "email": userEmail,
                profileStyle
              }                             
            });
          } catch (err) {
            console.error("Error: ", err);
          }
 
          const uploadPath = `users/${userEmail}/profilePhoto.png`;  
          // 試試 canvas 螢幕截圖  
          html2canvas(canvas).then(function(canvas) {
            // 截圖生成成功
            canvas.toBlob((blob) => {
              // Blob生成成功
              uploadBytes(ref(storage, uploadPath), blob).then(() => {
                setUploadStatus("上傳成功，自動刷新頁面");
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
            }, 'image/png');
          });
        } // if (canvas)
  }
    
    return (      
        <div>
            <Base></Base>
            {showUpload && <UploadBird onSelectedDateChange={handleDateChange}  onClose={() => setShowUpload(!showUpload)} />}{/*  */}
            <div className='main'>
            
            <div className='main-member'> {/* 鳥友會員頁 */}                
                <div className='user-box'> 
                  <div className='user-photo-container-box'>
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
                              position: 'relative',                 
                            }}
                                            
                             /> {/*className='user-photo'*/}
                            
                            </>
                        )
                    }                       
                    </div>
                    
                  </div>
                  <label htmlFor="upload-photo" className='upload-photo'>
                        <span className='choose'>{uploadStatus || '更換照片'}</span>                      
                        <input
                        type="file"
                        id="upload-photo"
                        accept='image/*'
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        />
                        {showUploadButton &&
                         <button onClick={handleUpload} className='upload-avatar'>上傳 !</button>
                        } 
                        
                    </label>
                    
                    <div className='user-name'>{userName}</div>  
                    <div className='logout-box'>
                      <button onClick={logout} className='logout'> 點此登出 </button>
                    </div>                
                </div>

                <div className='bird-section'>
                  <h1 className='h1'>會員作品展示區</h1>
                  
                    <div className='upload-and-bird'>
                    <button className='upload-bird' onClick={callUpload}
                      onClose={(onClose) => setShowUpload(false)} 
                    > + </button>                      
                      {getPhoto.map((getPhoto , index) => (  
                        <React.Fragment key={getPhoto}>
                        <div className="image-container" style={{ position: 'relative' }}>
                          <img key={getPhoto} src={getPhoto} className="get-user-photo" />  
                          <div className="bird-data-container" style={{ position: 'absolute', top: 0, left: 0 }}>
                            <div className='bird-data-name-container' style={{ position: 'relative', display: 'inline-block' , width: '100%'}}>
                              <p className='bird-data'>{birdName[index]} {birdTime[index]}</p>
                              <NavLink to={`/bird/${birdCode[index]}`}
                                style={{ width: '100%', height:'100%',
                                position: 'absolute', top: 0, left: 0}}
                              ></NavLink>
                            </div>
                            <div className='bird-data-local-container' style={{ position: 'relative', display: 'inline-block' }}>
                              <p className='bird-data'
                                style={{ 
                                  fontSize: '12px', overflow: 'hidden' ,
                                  textDecoration: 'none', color:'white'                                
                                  }}
                              >
                                {birdLocal[index]}                              
                            </p>
                            <NavLink to={`/hotspot/${locId[index]}`} 
                                style={{ width: '100%', height:'100%',
                                        position: 'absolute', top: 0, left: 0}}
                            ></NavLink>
                            </div>
                            {/* </div> */}
                          </div>
                        </div>                          
                        </React.Fragment>
                      ))}                        
                  </div>
                 
                </div>                   
            </div>{/* main-member-end */}
           
        </div>
        </div>
    )

}
export default MemberPage