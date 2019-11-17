// Imports the Google Cloud Tasks library.
const {CloudTasksClient} = require('@google-cloud/tasks');



var taskCreator = async function createTask(url,project,location,queue,serviceAccountEmail,inSeconds,cb) {
// Instantiates a client.
    const client = new CloudTasksClient();
    console.log("Seconds came in"+inSeconds);
// TODO(developer): Uncomment these lines and replace with your values.


// Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);

  /*  const convertedPayload = JSON.stringify(payload);
    const body = Buffer.from(convertedPayload).toString('base64');*/
/*    const inSeconds = 5;*/

    let task = {
        httpRequest: {
            httpMethod: 'GET',
            url,
            oidcToken: {
                serviceAccountEmail
            }
        }
    }

    if (inSeconds) {
        task.scheduleTime = {
            seconds: inSeconds + Date.now() / 1000,
        };
    }

    console.log("Scheduling task in " + inSeconds);

    const request = {
        parent: parent,
        task: task,
    };

    //console.log('Sending task:');
   // console.log(task);
// Send create task request.
    let response;
    try {
     [response] = await client.createTask(request);
    } catch(err){
        console.log(err);
        cb(err,null)
    }finally {
        const name = response.name;
        //console.log(`Created task ${name}`);
        cb(null,name)
    }

}


module.exports= taskCreator;

