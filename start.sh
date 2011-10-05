#
# This script runs the Instasoda services
#
clear
echo "===================================================="
echo "==         INSTASODA activation sequence          =="
echo "===================================================="
echo "==  Activating Instasoda website and API service  =="
echo "===================================================="
forever stopall
forever start api/index.js
forever start web/index.js
echo "===================================================="
echo "== SUCCESS!                                       =="
echo "== Type 'forever list' to view details            =="
echo "===================================================="
