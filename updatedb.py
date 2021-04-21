import requests

def convertCodes(code):
    if code in ["CLOSED", "DUPLICATE (CLOSED)", "CLOSED (DUPLICATE)"]:
        return "Closed"
    elif code in ["IN-PROGRESS", "IN-PROGRESS (DUPLICATE)"]:
        return "In-Progress"
    elif code in ["DUPLICATE (OPENED)", "OPEN", "OPEN (DUPLICATE)"]:
        return "Open"
    else:
        return "Unknown"

def idDupes(code):
    if code in ["DUPLICATE (CLOSED)", "CLOSED (DUPLICATE)", "IN-PROGRESS (DUPLICATE)", "DUPLICATE (OPENED)", "OPEN (DUPLICATE)"]:
        return True
    else:
        return False

def updateDB(collection, month):
    begin = f"0{month}"
    end19 = f"2019-0{int(month)+1}-01"
    end20 = f"2020-0{int(month)+1}-01"
    if int(month) > 9:
        begin = f"{month}"
        if int(month) == 12:
            end19 = "2019-12-31"
            end20 = "2020-12-31"
        else:
            end19 = f"2019-{int(month)+1}-01"
            end20 = f"2020-{int(month)+1}-01"
    elif int(month) == 9:
        end19 = "2019-10-01"
        end20 = "2020-10-01"
    between = f"ADDDATE BETWEEN DATE '2019-{begin}-01' AND DATE '{end19}'"
    r2019 = requests.get(f"https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/ServiceRequests/MapServer/10/query?where={between}&outFields=*&outSR=4326&f=json")
    data2019 = r2019.json()
    features2019 = data2019['features']
    for entry in features2019:
        code = entry['attributes']["SERVICEORDERSTATUS"].upper()
        entry['attributes']["STATUS"] = convertCodes(code)
        entry['attributes']["DUPLICATE"] = idDupes(code)
        entry['attributes']["YEAR"] = "2019"
    between = f"ADDDATE BETWEEN DATE '2020-{begin}-01' AND DATE '{end20}'"
    r2020 = requests.get(f"https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/ServiceRequests/MapServer/11/query?where={between}&outFields=*&outSR=4326&f=json")
    data2020 = r2020.json()
    features2020 = data2020['features']
    for entry in features2020:
        code = entry['attributes']["SERVICEORDERSTATUS"].upper()
        entry['attributes']["STATUS"] = convertCodes(code)
        entry['attributes']["DUPLICATE"] = idDupes(code)
        entry['attributes']["YEAR"] = "2020"
    collection.remove( {} )
    collection.insert_many(features2019)
    collection.insert_many(features2020)
