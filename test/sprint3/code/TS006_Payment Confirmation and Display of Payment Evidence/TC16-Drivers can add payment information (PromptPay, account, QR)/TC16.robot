*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup       Setup Browser
Suite Teardown    Close Browser

*** Variables ***
${URL}            http://localhost:3001/login
${PAYMENT_URL}    http://localhost:3001/profile/payment-info
${BROWSER}        chrome
${USERNAME}       Driver
${PASSWORD}       t1234567

${PROMPTPAY}      0812345678
${ACCOUNT_NO}     1234567890
${QR_PATH}        ${CURDIR}/QRtest2.png


*** Test Cases ***
TC20 Driver Setup Payment Info Complete
    Login As Driver
    Capture Page Screenshot    

    Open Payment Page
    Capture Page Screenshot    payment_page.png

    Fill PromptPay
    Capture Element Screenshot    xpath=//input[contains(@placeholder,'QR')]    promptpay.png

    Add Bank Account
    Capture Page Screenshot    add_bank.png

    Upload QR Code
    Capture Page Screenshot    upload_qr.png

    Verify Success
    Capture Page Screenshot    success.png

*** Keywords ***

Setup Browser
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

  
    Set Selenium Speed    0.8s


Login As Driver
    Wait Until Element Is Visible    id=identifier    15s
    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Click Element    xpath=//button[@type="submit"]
    Sleep    2s


Open Payment Page
    Go To    ${PAYMENT_URL}
    Wait Until Page Contains    ข้อมูลการรับเงิน    10s
    Sleep    2s


Fill PromptPay
    Wait Until Element Is Visible    xpath=//input[contains(@placeholder,'QR')]    10s

    Clear Element Text    xpath=//input[contains(@placeholder,'QR')]
    Input Text    xpath=//input[contains(@placeholder,'QR')]    ${PROMPTPAY}

    Capture Element Screenshot    xpath=//input[contains(@placeholder,'QR')]    promptpay_input.png

    Click Element    xpath=//button[contains(.,'บันทึก')]
    Sleep    2s


Add Bank Account
    Click Element    xpath=//button[contains(.,'เพิ่มบัญชี')]
    Wait Until Page Contains    เพิ่มบัญชีธนาคาร    10s
    Sleep    2s

    # 📸 แคป popup
    Capture Page Screenshot    popup_bank.png

    ${modal}=    Set Variable    xpath=//div[contains(@class,'fixed')]

    Click Element    ${modal}//button[.//span[text()='เลือกธนาคาร']]
    Sleep    1s

    Capture Page Screenshot    dropdown_bank.png

    Click Element    ${modal}//button[.//span[contains(text(),'ธนาคารกรุงไทย')]]
    Sleep    1s

    Input Text    ${modal}//input[contains(@placeholder,'123')]    ${ACCOUNT_NO}

    Capture Element Screenshot
    ...    ${modal}//input[contains(@placeholder,'123')]
    ...    account_input.png

    Scroll Element Into View    ${modal}//button[contains(.,'เพิ่มบัญชี')]

    Capture Element Screenshot
    ...    ${modal}//button[contains(.,'เพิ่มบัญชี')]
    ...    add_account_btn.png

    Click Element    ${modal}//button[contains(.,'เพิ่มบัญชี')]

    Sleep    3s


Upload QR Code
    Execute JavaScript
    ...    document.querySelector("input[type='file']").classList.remove("hidden");

    Sleep    1s

    Choose File    xpath=//input[@type="file"]    ${QR_PATH}

    Capture Page Screenshot    qr_selected.png

    Click Element    xpath=//button[contains(.,'อัปโหลด QR')]

    Sleep    3s


Verify Success
    Page Should Contain    PromptPay
    Capture Page Screenshot    final_success.png