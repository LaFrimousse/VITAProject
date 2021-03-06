# Human Live Pose Estimation Using PifPaf
A web application used to train a neural network with user's body postures, and then detects the poses the users might take.

## A propos:
This project is my Bachelor project done at the EPFL with the VITA Laboratory. (https://www.epfl.ch/labs/vita/) It corresponds to a 8 ECTS class. </br>
Jonathan Kaeser

## Why the project is useful ?
There is no way in 2019 to ignore the fact that self-driving vehicles is the future of human transportation. A lot of research in this domain is made each and every day. The purpose of this project was to provide an interface where users first take pictures of themselves miming traffic officer gestures, and then use theses data to train a neural network that recognise any future posture they will adopt.  
This can be very useful if we consider a self driving car that has to interpret the gesture that a traffic warden might make.

## What the project does:
This project provides a complete web interface where the users can choose between 5 different postures to adopt. For each of theses 5 categories, they can record themselves using their device's camera.
They see the frame that were captured, and can choose to delete any pictures that they think was not adapted for the category they were supposed to record a picture for.
<br><img src="Presentation/images/pictdet.png" alt="drawing" width="200"/><br>

Because this web interface communicates (using the HTTP protocol) with a python server running the PifPaf algorithm (https://www.epfl.ch/labs/vita/research/perception/pifpaf/), the user might also just play with the interface to see the performance that the PifPaf algorithm can reach.
<br><img src="Presentation/images/livePoints.png" alt="drawing" width="200"/><br>


This interface uses a single cookie to track the users across their sessions. This cookie is only used to fetch the previous data that was taken by the users. For privacy purpose, if somebody took 25 pictures a week before, only 25 arrays of 17 points will be automatically saved and fetched from Firebase. (Each of the 17 points indicates the x and y coordinates of 17 remarkable points on the image. The eyes, ears, nose, shoulder, wrist, elbows, hips, knees, and feet of the users).<br>
It is up to the user to decide if they actually want to store their pictures on Firebase. As long as they decide not to, no picture of them is saved on the web.
![Alt text](Presentation/images/skeletons.png?raw=false "Title")

Once they are done with the phase of collecting new data, they can click a button and go in "recognition mode". In this mode, the interface continually tries to identify the position that the user is adopting in front of the camera. The user can choose to use a neural network trained with the data collected on all users that previously used this interface (the default mode), or only trained with his own pictures.<br>
The TensorFlow.js library (https://www.tensorflow.org/js) is the library used to train the model and to make the predictions.
![Alt text](Presentation/images/liveReco.gif?raw=false "Title")

 ## How to get started:
 You can just download the W14 folder, all the final code is inside it. (As this project was made over 14 weeks, the 'W14' stands for 'Week 14'. The other folders act like the history of the project).
 Before opening index.html to run the web interface, you need to have a connection to a server that runs the PifPaf algorithm. You might need to change the url used to connect to the server running that algorithm. Please just reassign the local variable URL_PIF_PAF in the server.js file. <br>
 You can download the source code of the PifPaf server at this address: https://github.com/vita-epfl/openpifpaf to run it locally on your computer, in case you don't have access to such a server on the web. 
 Please for the best experience possible, ensure that your browser uses and stores cookies even browsing local files.
 Enjoy ;-)
