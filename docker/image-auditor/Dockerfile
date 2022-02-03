FROM node:16.13.2
LABEL MAINTAINER_NAME="Ivan Vecerina"

# When we build the image, we copy the folder content in the image/server file system. 
#
COPY src/ /opt/app

CMD ["node", "/opt/app/auditor.js"]